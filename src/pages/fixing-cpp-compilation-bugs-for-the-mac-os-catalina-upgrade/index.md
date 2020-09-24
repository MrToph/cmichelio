---
title: Fixing C++ compilation bugs for the MacOS Catalina upgrade
date: 2020-09-24
image: ./featured.png
categories:
- Tech
- EOS
- learneos
medium:
- macos
- catalina
- Programming
- C++
steem:
- macos
- catalina
- Programming
- C++
---

I recently updated to macOS Catalina and encountered several issues with programs that use a C/C++ compiler.
If you see any of these errors this post might be helpful for you:

```bash
/usr/local/Cellar/llvm/7.0.1/include/c++/v1/wchar.h:119:15: fatal error: 'wchar.h' file
      not found
#include_next <wchar.h>
              ^~~~~~~~~
1 error generated.
```

Or any error indicating that a standard library couldn't be found:

```bash
ld: library not found for -ldl
clang-10: error: linker command failed with exit code 1 (use -v to see invocation)
```

## What's the issue?

The issue is that macOS Catalina doesn't use the `/usr/include` and `/usr/lib`/ directories anymore for all C++ headers and libraries.
A lot of projects rely on these directories to exist, can't find the files and then break.
Instead they are under the xcode path and you need to tell the C/C++ compiler where to find these libraries now.

## How to fix it?

1. Optionally, install a C++ compiler like clang / gcc through `brew` if one is missing.
2. Install **Xcode** through the App store to get access to the developer command-line tools.
This will install the C++ header files and libraries, albeit, in a different directory. They will be installed in `/Library/Developer/CommandLineTools/SDKs/MacOSX10.15.sdk` or a similar directory. To get the correct path for your system you can run the `xcrun --show-sdk-path` command.
1. The C++ compiler needs to be told to look at this root path instead of `/usr/include`. This can be done by setting the `CPLUS_INCLUDE_PATH` env variable. It's important to also **include LLVM's normal include path** because this is where it should search first.
    ```bash
    # adjust your llvm and CLT include paths to match your setup
    export CPLUS_INCLUDE_PATH=/usr/local/opt/llvm/include/c++/v1:/Library/Developer/CommandLineTools/SDKs/MacOSX10.15.sdk/usr/include
    ```
    This should fix any `fatal error: 'xxx.h' file not found` errors.
1. You might still run into linker errors like `ld: library not found for -lxxx`. The linker also needs to be told to look for libraries in the CommandLineTools/Xcode paths by setting the `LIBRARY_PATH` env variable.
    ```bash
    export LIBRARY_PATH=$LIBRARY_PATH:/Library/Developer/CommandLineTools/SDKs/MacOSX10.15.sdk/usr/lib
    ```
2. Make sure to add these `export` statements to your `.bash_rc`, `.zshrc`, `.bash_profile`, or whatever shell you use, to make these adjusted environment variables available in all terminals.

### Resources

Thanks a lot to this [GitHub post](https://github.com/imageworks/OpenShadingLanguage/issues/1055#issuecomment-581920327) for helping me figure out what's wrong.
