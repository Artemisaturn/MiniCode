# 跨平台代码编辑器

#### 介绍
2020年《软件工程课程设计》可选题目。

实现一个跨平台的代码编辑器（Windows、linux）。

#### 需求
1. 【必选】系统必须支持跨平台使用。最低：支持windows和linux平台；最高：适配其他平台。
2. 【必选】系统支持基本的文本编辑功能。最低：文档的打开、新建 文本复制、粘贴、撤销、重做、查找、替换；最高：文本查找支持正则表达式，支持树形目录管理项目，并支持在整个项目中查找替换文本，支持document map。
3. 【必选】系统支持语法高亮提示。最低：支持一种主流编程语言（C、Java、C++、Python等）或者标记语言（markdown、html）的高亮提示与智能提示（代码自动补全）；最高：支持用户编写自定义的高亮方案应用，根据文件拓展名自动应用高亮方案支持代码块的折叠、支持括号成对插入自动保持缩进。
4. 【必选】系统支持不同编码的文本文件。最低：至少支持UNICODE和ANSI编码格式选择；最高：支持不同编码文件之间的转换。
5. 【非必选】系统支持在编辑器中使用终端。
6. 【非必选】系统支持编译运行代码。最低：直接嵌入一种语言的编译器，实现编译后运行；最高：通过编写配置文件，自定义编译方案，调用外部编译器。
7. 【非必选】代码补全。最低：支持基于模板的代码补全（上下文无关）；最高：能够根据当前的上下文给出代码补全的建议。
8. 【非必选】代码提示。最低：当鼠标悬停在代码中的变量、函数、类等构造物时，能够显示它们的定义。
9. 【必选】代码检查。最低：编辑器能够检查代码中的词法和语法错误；最高：编辑器能够检查代码中的语义错误。

#### 难度说明
- 只完成最低必选需求时，难度系数只有1.0

#### 提示
 **传统方法** 
- 考虑到需要跨平台，所以传统上采用qt或者gtk的不同语言绑定开发。

 **新开发方法** 
- 可选采用Web开发桌面应用程序，参考框架：Electron
- 可选基于Eclipse平台开发编辑器插件（注意，Eclipse本身是跨平台的），开发工具：Xtext
