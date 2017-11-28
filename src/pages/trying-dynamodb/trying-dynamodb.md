---
author: Christoph Michel
comments: true
date: 2017-11-11
disqus_identifier: trying-dynamodb
layout: Post
route: /trying-dynamodb/
slug: trying-dynamodb
title: Trying DynamoDB for the first time
categories:
- Tech
- Backend
---

I tried the hyped [serverless framework](https://github.com/serverless/serverless) for a new project of mine. I used AWS Lambda for my backend logic and had to decide on a database to use along with it.
The natural choice is **DynamoDB**, because its integration with AWS Lambda is really simple.
While I'm really impressed with AWS Lambda, I feel disappointed trying out DynamoDB.
It has some severe restrictions and takes a lot of additional development effort to do tasks that are really easy with MongoDB.

### How it works
Like any other database you can create tables and define attributes with indexes on them. Although, you seem to not be able to structure your tables under a common database name. So all your tables for different apps are in the same dashboard. Am I supposed to create a new AWS account for every new side project? I just used a naming convention `<appName>.<tableName>` instead.

#### The Pricing model
DynamoDB uses a metric called RCU to determine how much load your tables (or more precise, your indexes) can handle. This directly corresponds to how much you'll be charged in the end.
RCU stands for *R*ead *C*apacity *U*nits and 1 RCU means that your DB queries [can read 8KB of data **per second**](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html). (WCU / Write Capacity Units are a similar metric for writing to the table.)

But what does this even mean? In which time frame is this accumulated? Is it a hard cap, i.e., even if I only have a single big query *once a month*, I may not read more than 8KB? Or can I read 60 * 8KB=480KB _per minute_ (20MB _per month_?) before my queries time out?

It's explained in an unrelated article about [Best Practices for Querying and Scanning Data](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForTables.html#GuidelinesForTables.Bursting):

<blockquote class="twitter-tweet" data-lang="de"><p lang="en" dir="ltr">if I was voldemort I would&#39;ve hid my horcruxes in the aws ui</p>&mdash; I Am Devloper (@iamdevloper) <a href="https://twitter.com/iamdevloper/status/912185400336232449?ref_src=twsrc%5Etfw">25. September 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

> "When you are not fully utilizing a partition's throughput, DynamoDB retains a portion of your unused capacity for later bursts of throughput usage.  DynamoDB currently retains up to five minutes (300 seconds) of unused read and write capacity.  During an occasional burst of read or write activity, these extra capacity units can be consumed very quickly—even faster than the per-second provisioned throughput capacity that you've defined for your table. However, do not design your application so that it depends on burst capacity being available at all times: DynamoDB can and does use burst capacity for background maintenance and other tasks without prior notice."

So it's averaged over a 5 minute time frame, but you shouldn't rely on it and it might change in the future.

### Some things I wish I had known before using DynamoDB
Here are some issues I came across while building the backend for a quiz app:

#### Query Conditions only work on indexes
There are roughly two types of ways to search a table: Using `Query` and `Scan`.
1. When you want to search for all items with a condition on a specific attribute, that attribute must be an index (using a [`KeyConditionExpression`](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html)). Or, you can use a `Scan` instead of a `Query`, however the use of `Scan`s is discouraged as it will always scan the whole database and thus consume a lot of RCUs.
1. You cannot query multiple items. Let's say you want to query 10 items with `id`s of `random-uuid-1` up to `random-uuid-10`. You cannot do this using a `Query`, because `KeyConditionExpression`s don't have an `IN` operator and don't allow the `OR` operator: 
> `Invalid operator used in KeyConditionExpression: OR`.

   Instead, you have to retrieve the ten items with all their attribute by using [`BatchGet`](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html). The problem with this is that a `BatchGet` again consumes more RCUs than a `Query`:  
   Let's say the size of each of these items is only 0.5 KB. If we could query all of them we would need 1 RCU, because 10*0.5KB=5KB < 8KB ≈ 1 RCU. With `BatchGet` however, each item read is counted individually and therefore consumes the minimal 8KB ≈ 1 RCU each time, i.e., you'll need 10 RCU to get these items.

#### Cannot use boolean types on indexes
As of now boolean types are not allowed for index attributes. So what do you do when you have an `active` boolean field on your items and you want to write a query that returns only the active items?

You make `active` a string, and when an item is active you set its `active` field to any value (except empty string, which is an illegal value for a string attribute 🤷‍). When an item is inactive, you delete the `active` attribute from it. You then create a sort key / secondary index on `active` for your desired behavior. This is the recommended way and you can read why it works in [Take Advantage of Sparse Indexes](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForLSI.html#GuidelinesForLSI.SparseIndexes).
This is just one of those simple things that take a lot of developer effort to work in DynamoDB.

#### No way to get a random item
Being the backend for a quiz app, there should be the functionality to sample one or more random items from the table.
In MongoDB, you can just use [`$sample`](https://docs.mongodb.com/manual/reference/operator/aggregation/sample/). In DynamoDB, I thought of several approaches that all had a drawback in the end or seemed to go against what is considered good practice in DynamoDB.

Assume we have a big table with items who all have an index `id`. We want to randomly sample 10 items without scanning the whole database.
##### 1. Sequential numbers as `id`
We can just use a counter as `id`. To sample, we then get the maximum `id`, sample 10 integers in the range [0, ..., maxId], and query the items with these ids.
This has several problems:
* How do we get the `maxId` in DynamoDB without scanning the whole DB?
* We end up with holes if we remove items. These holes are not easy to fix.
* This probably doesn't give a good partitioning of the table [which can lead to performance problems](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForTables.html#GuidelinesForTables.UniformWorkload).

##### 2. Use random `id`s and cache them in the API accessing the DB
We can use random `id`s for the items. Whenever a request to sample items is made, we would scan the whole database once, and then cache the `ids`. Now just sample 10 `ids` and retrieve these items. The next time we need to sample items, we just use the cached version of the `ids` and can avoid the whole table scan.

I thought this was a nice and simple idea to implement, however the caching would have to be implemented *inside* my AWS Lambda function. There seem to be [caching solutions for AWS Lambda](https://medium.com/@tjholowaychuk/aws-lambda-lifecycle-and-in-memory-caching-c9cd0844e072), but the main idea of cloud functions is that they are stateless and ephemeral, in order for them to be easy to scale. I didn't follow this approach any further.

##### 3. Use random `id`s and store all `id`s in the DB.
This is the approach I ended up using. We again use random `id`s. In my concrete use case (quiz) the items (questions) are only updated manually, and therefore it is suitable that I have a **unique item in the table** that stores all other item `id`s. My lambda function then queries this item, gets a list of all ids, samples 10 at random, and calls `BatchGetItem` to get the actual item data.

Still this has some drawbacks:
* The `indexes` item is quite big and consumes many RCU. Items may not exceed 400 KB in DynamoDB, therefore you may need to split up the `indexes` item into several onces, making this approach more complicated.
* You're accessing one item (`indexes`) a lot of times [which can lead to performance problems](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForTables.html#GuidelinesForTables.UniformWorkload).
> "For example, if a table has a very small number of heavily accessed partition key values, possibly even a single very heavily used partition key value, request traffic is concentrated on a small number of partitions – potentially only one partition."

I'd love to see a better idea on how to sample items in DynamoDB. Please reach out to me if you have one.
