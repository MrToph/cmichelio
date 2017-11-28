---
author: Christoph Michel
comments: true
date: 2016-08-18 20:31:19+00:00
disqus_identifier: 368 http://cmichel.io/?p=368
layout: Post
route: /moving-wordpress-to-a-different-domain/
slug: moving-wordpress-to-a-different-domain
title: Moving Wordpress to a different domain
categories:
- WordPress
---
WordPress has become a cluttered mess with thousands of plugins and hot fixes, such that even the simple things, like transfering your WordPress site to a new domain, come with dozens of bugs. This serves as a guide on how to make a domain change carrying over your Wordress site while fixing the bugs I encountered.

### 1. Export your WordPress contents from your old site
You want to transfer your posts, pages, media, and plugins to your new site. WordPress made this easy, you login to your dashboard and go to "Tools -> Settings -> Export", check "All Content" and click on "Download Export file" to save a backup of your contents.

### (1.1 Optional: Keep backslashes when importing)
When you import a post, it can happen that the importer strips off some backslashes. Especially, if you use LaTeX code in one of your posts, your commands will not work anymore after importing. To prevent this from happening, connect to your new domain's FTP server and navigate to your WordPress installation's "wp-includes" folder and open "post.php". The following line is responsible for removing the slashes when importing, so temporarily comment it:
`$data = wp_unslash( $data );`
Change to:
`// $data = wp_unslash( $data );`

### 2. Import into your new site
Login to your dashboard of your new site and go to "Tools -> Settings -> Import". There, you see several importer plugins, none of which are installed by default. We will use "WordPress", so click on "Install now", after that on "Activate". You can now "Run Importer", select your exported .xml file from step 1 and upload it. The posts will get transfered and will need a new author in your new domain, whom you can select here. Also, check "Download and import file attachments".
![WordPress Import](http://cmichel.io/assets/2016/08/wordpress-import.png)

### 3. Fix your image sources
If you did everything right, the previous import should have imported all images used in posts as "Media". However, if you actually look at a post, the images still point to "oldDomain.tld/image-path".
To make them point to your new domain, we will use the plugin "MediaTools". Install and active the plugin and go to "Tools -> Media Tools", choose the "Import External Images" option pictured below.
![WordPress MediaTools Import External Images](http://cmichel.io/assets/2016/08/wordpress-mediatools-import-images.png)
This will search your posts/pages for image links and replace them if it finds a matching image in your Media library.

### 4. Redirect your old domain to your new domain
It's important that you redirect your old domain to your new domain to keep your Google search rankings. When the Google bot visits your website, you want to show him a 301 Moved Permanently Redirect message to your new domain. This works by modifying your ".htaccess" in your old domain to:
`Options +FollowSymlinks
RewriteEngine On
RewriteCond %{HTTP_HOST} ^oldDomain.com [NC]
RewriteRule ^(.*)$ http://newDomain.com/$1 [L,R=301]
RewriteCond %{HTTP_HOST} ^www.oldDomain.com [NC]
RewriteRule ^(.*)$ http://newDomain.com/$1 [L,R=301]`

This is what worked for me. Be sure to uncomment the line in "wp-includes/post.php" if you changed it in step 1.1.
