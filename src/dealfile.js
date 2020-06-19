const fs = require('fs')
const iconv = require('iconv-lite')
const remote = require('electron')
const {dialog} = require('electron').remote
const {ipcRenderer} = require('electron')
const path = require('path')
const process = require('process')
const openT=require('./renderer')

const ourname = 'Mini Code'     //　我们编译器的名字
let filenum = 1                 //　文件的编号
let txtEditor = document.getElementById('txtEditor')　//　得到ｈｔｍｌ中的文本编辑器 
let isSaved = true              //　当前文件是否保存
var currentFile = null          //　当前文件目录
let filelist = document.getElementById('filelist')
let select2 = document.getElementById('select2')
let file_list = document.getElementById('file-list')
let now_dirname = ''            // 当前文件夹目录
let listnum = 1                 // 当前list编号(左部分)
let lid = 0                     // 当前编辑文件id编号最大值
let namelist = []               // 编辑器打开所有文件名字
let dirlist = []                // 编辑器打开所有文件目录
let textlist = []               // 编辑器打开所有文件当前编辑内容
let contentlist = []            // 编辑器打开所有文件原本内容
let listid = []                 // 编辑器打开所有文件编号
let now_id = 0                  // 编辑器当前编辑文件编号

// editor.on("update",function(){
//     if(now_id != 0){
        
//         index1 = listid.indexOf(now_id)
//         textlist[index1] = editor.getValue()
//         console.log(index1)
//         console.log(editor.getValue())
//     }
    
// })
/**
 * 和主进程通信(与文件相关)
 */
ipcRenderer.on('action', (event,arg)=>{
    switch(arg){
        // 新建文件的响应
        case 'newfile':
            newFile()
            break
        //　保存文件的响应
        case 'savefile':
            if(now_id != 0){
                saveFileById(now_id)
            }
            break
        //　打开文件的响应
        case 'openfile':
            openFile()
            break
        //　关闭编辑器的响应
        case 'closefile':
            closeFile()
            break
        // 另外存文件
        case 'saveinoterfile':
            if(now_id != 0){
                saveInOtherFileById(now_id)
            }
            break
        // 打开文件夹
        case 'openfileshow':
            openfileshow(__dirname)
            break 
        // 查找 
        case 'find':
            find()
            break
        // 向后查找
        case 'findNext':
            findNext()
            break  
        // 向前查找
        case 'findPrev':
            findPrev()
            break 
        // 替换
        case 'replace':
            replace()
            break  
        // 替换全部
        case 'replaceAll':
            replaceAll()
            break
        // 打开文件夹
        case 'opendir':
            openDir()
            break      
    }
})

/**
 * 根据文件ID关闭文件
 * @param {*} fileId 
 */
function closeFileById(fileId){
    index = listid.indexOf(fileId)                  // 获取当前Id对应数列编号
    var lis = file_list.getElementsByTagName("li")
    if(fileId == now_id){                           // 判断关闭的文件id和当前编辑的文件id是否相同
        textlist[index] = editor.getValue()         // 记录当前编辑器的内容
    }
    if(textlist[index] != contentlist[index]){      // 判断文件内容是否被修改
        dialog.showMessageBox(                      // 提示要不要保存文件
            {
                message:'你需要保存文件 ' +namelist[index]+' 吗？',
                type:'question',
                buttons:['是','否']
            }
        ).then((index2) =>{                         // 选择内容：是 0 否 1
            if(index2.response===0){
                saveFileById(fileId)                // 保存文件
            } 
            file_list.removeChild(lis[index])       // 在数组中删去该页签
            namelist.splice(index,1)
            dirlist.splice(index,1)
            textlist.splice(index,1)
            contentlist.splice(index,1)
            listid.splice(index,1)
        })
    } else {                                        
        file_list.removeChild(lis[index])           // 在数组中删去该页签
        namelist.splice(index,1)
        dirlist.splice(index,1)
        textlist.splice(index,1)
        contentlist.splice(index,1)
        listid.splice(index,1)
    }
    if(fileId == now_id){
        editor.setValue('')                         // 如果关闭当前编辑的文件将编辑器内容清空
    }   
}

/**
 * 通过文件页签编号另外存文件
 * @param {Integer} fileId 
 */
function saveInOtherFileById(fileId){
    index = listid.indexOf(fileId)
        file = dialog.showSaveDialogSync(           // 弹出另外存对话框，同时保存文件目录
            {    
                title:"保存文件",                    // 对话框标题
                buttonLabel:'保存',                 // 确定选项
                filters: [
                    { name: 'All Files', extensions: ['*'] }
                ]
            })
        dirlist[index] = file                       // 修改对应文件目录记录
        if(dirlist[index]){
            fs.writeFileSync(dirlist[index],textlist[index])    // 写文件内容
            contentlist[index] = textlist[index]                // 修改对应对应文件内容记录
            let index1 = dirlist[index].lastIndexOf('.') + 1    // 获取文件后缀名subs
            let subs = ''
            if (index1 != 0){
            subs = dirlist[index].substr(index1,dirlist[index].length-index1)
            }
            chooseMode(subs)                                    // 根据文件后缀名修改编辑器模式
            let index2 = dirlist[index].lastIndexOf('/') + 1    // 获取文件名subs2
            if(process.platform == 'win32'){
                index2 = dirlist[index].lastIndexOf('\\') + 1
            }
            let subs2 = ''
            if(index2 != 0){
                subs2 = dirlist[index].substr(index2,dirlist[index].length - index2)
            } else {
                subs2 = dirlist[index]
            }
            namelist[index] = subs2                             // 根据文件名修改文件名记录
            var lll = document.getElementById(fileId+'')        // 获取html中页签
            var node1 = lll.firstChild
            node1.textContent = namelist[index]                 // 修改html对应页签文本
            document.title=dirlist[index]+ ' ' + ourname        // 修改标题
        }
        openfileshow(now_dirname)                               // 更新当前文件夹内容（文件有可能保存改目录）
}

/**
 * 通过文件页签编号保存文件
 * @param {*} fileId 
 */
function saveFileById(fileId){
    
    index = listid.indexOf(fileId)
    if(now_id == fileId){
        textlist[index] = editor.getValue()                    // 记录下当前编辑器内容
    }
    if(dirlist[index] == null){                                // 判断是否要保存文件的目录为空
        file = dialog.showSaveDialogSync(
            {    
                title:"保存文件",
                buttonLabel:'保存',
                filters: [
                    { name: 'All Files', extensions: ['*'] }
                ]
            })
        dirlist[index] = file
    }
    if(dirlist[index]){
        fs.writeFileSync(dirlist[index],textlist[index])    // 写文件内容
        contentlist[index] = textlist[index]                // 修改对应对应文件内容记录
        let index1 = dirlist[index].lastIndexOf('.') + 1    // 获取文件后缀名subs
        let subs = ''
        if (index1 != 0){
        subs = dirlist[index].substr(index1,dirlist[index].length-index1)
        }
        chooseMode(subs)                                    // 根据文件后缀名修改编辑器模式
        let index2 = dirlist[index].lastIndexOf('/') + 1    // 获取文件名subs2
        if(process.platform == 'win32'){
            index2 = dirlist[index].lastIndexOf('\\') + 1
        }
        let subs2 = ''
        if(index2 != 0){
            subs2 = dirlist[index].substr(index2,dirlist[index].length - index2)
        } else {
            subs2 = dirlist[index]
        }
        namelist[index] = subs2                             // 根据文件名修改文件名记录
        var lll = document.getElementById(fileId+'')        // 获取html中页签
        var node1 = lll.firstChild
        node1.textContent = namelist[index]                 // 修改html对应页签文本
        document.title=dirlist[index]+ ' ' + ourname        // 修改标题
    }
    openfileshow(now_dirname)                               // 更新当前文件夹内容（文件有可能保存改目录）
}

/**
 * 添加标签记录
 * @param {String} filename 
 * @param {String} dirnow 
 * @param {String} texts 
 */
function addFileList(filename,dirnow,texts){
    if(now_id != 0){
        index1 = listid.indexOf(now_id)
        if(index1 >= 0 && index1 < listid.length){
            textlist[index1] = editor.getValue()    // 记录当前编辑器内容
        }
        
    }
    var i = 0
    for(i = 0; i < namelist.length; i++){
        if(namelist[i] == filename && dirlist[i] == dirnow) // 在当前页签中查找是否有相同路径的
            break;
    }
    if(i == namelist.length){                   // 如果该页签在之前没有添加
        namelist.push(filename)                 // 新建页签项
        dirlist.push(dirnow)
        textlist.push(texts)
        contentlist.push(texts)
        listid.push(lid+1)
        var t = document.createElement("li");   // html中添加页签
        var k = document.createTextNode(filename)
        lid = lid+1;
        k.id = lid+'text'
        t.id = lid
        t.onmouseover = function(){             // 鼠标上浮相应
            this.style.cursor = "pointer"       // 将鼠标改为指示
        }
        t.onmousedown = function(e){            // 鼠标点击相应
            if(e.button == 2){                  // 2为右键
                closeFileById(parseInt(this.id))// 关闭选定文件
            }
        }
        t.onclick = function(){                 // 左键点击相应
            if(dirnow != null)                  // 文件为命名文件
                readfile(dirnow)            
            else {                              // 文件为非命名文件
                editor.setOption("mode","text/x-c++src")    //新建文件默认语言
                if(now_id != 0){
                    var j = listid.indexOf(now_id)
                    if(j>=0 && j < textlist.length){
                        textlist[j] = editor.getValue()    // 记录当前编辑器内容
                    }
                }
                var j = listid.indexOf(parseInt(this.id))   // 获取该id文件标号
                var lis = file_list.getElementsByTagName('li')
                for(var k = 0; k < lis.length; k++){
                    lis[k].className=""                   // 将html所以的页签都取消标记
                }

                this.className='t1'                     // 当前页签设置为标记状态
                editor.setValue(textlist[j])            // 编辑器内容设置值
                document.title=namelist[j]                    
                now_id = listid[j]                      // 修改当前编辑文件标号
            }
            
        }
        t.appendChild(k)
        file_list.appendChild(t)
        var lis = file_list.getElementsByTagName('li')
        for(var j = 0; j < lis.length-1;j++){
            lis[j].className=""                      // 将html所以的页签都取消标记   
        }
        lis[lis.length-1].className='t1'             // 当前页签设置为标记状态
        editor.setValue(texts)                       // 设置编辑器内容
        now_id = lid;                                // 修改当前标号
    } else {
        var lis = file_list.getElementsByTagName('li')
        for(var k = 0; k < lis.length; k++){
            lis[k].className=""
        }
        var lll = document.getElementById(listid[i]+'')
        lll.className='t1'
        editor.setValue(textlist[i])
        currentFile = dirlist[i]
        now_id = listid[i]
    }
}


/**
 * 新建文件
 */
function newFile() {
    console.log('新建文件中...')
    filenamet = '未命名文件 '+ filenum;
    document.title='未命名文件 '+ filenum + ' '+ ourname 　   //　更新文件名
    filenum += 1                                            //　文件数加１
    currentFile=null                                        //　文件路径丢失                                   
    editor.setOption("mode","text/x-c++src")               //新建文件默认语言
    isSaved=true
    addFileList(filenamet,currentFile,"");
}


/**
 * 打开文件
 */
function openFile() {
    console.log('打开文件中...')
    files = dialog.showOpenDialogSync({
        title:"打开文件",                               //　对话框名称
        buttonLabel:'就是你了',                         //　对话框选择名称
        properties:['openFile'],
        filters:[        
            {name:'All Files', extensions:['*']},  //　针对不同文件的过滤器
        ]
    })
    if(files){
        currentFile = files[0]
        readfile(currentFile);
        document.title=currentFile+ ' ' + ourname
    }
}

/**
 * 选择mode
 */
function chooseMode(subs){
    if(subs == "js"){
        editor.setOption("mode","text/javascript")
    } else if (subs == "c") {
        editor.setOption("mode","text/x-csrc")
    } else if (subs == "cpp") {
        editor.setOption("mode","text/x-c++src")
    } else if (subs == 'h'){
        editor.setOption("mode","text/x-c++src")
    } else if (subs == "cs") {
        editor.setOption("mode","text/x-csharp")
    } else if (subs == "java") {
        editor.setOption("mode","text/x-java")
    } else if (subs == "py") {
        editor.setOption("mode","text/x-python")
    } else if (subs == "html") {
        editor.setOption("mode","text/html")
    } else if (subs == "css") {
        editor.setOption("mode","text/css")
    } else if (subs == "md") {
        editor.setOption("mode","text/x-markdown")
    } else if (subs == "sql") {
        editor.setOption("mode","text/x-sql")
    } else {
        editor.setOption("mode","text/x-markdown")
    }
}

/**
 * 读取文件内容
 */
function readfile(dir){
    let data = fs.readFileSync(dir, 'utf-8')    // 读取对应目录下内容
    let index1 = dir.lastIndexOf('.') + 1       // 获取文件名后缀
    let subs = ''
    if (index1 != 0){
        subs = dir.substr(index1,dir.length-index1)
        
    }
    chooseMode(subs)                            // 根据后缀名确定当前编辑器模式
    currentFile = dir
    //txtEditor.value = data                      // 设置编辑器内容
    
    let index2 = dir.lastIndexOf('/') + 1       // 获取文件名subs2
    if(process.platform == 'win32'){
        index2 = dir.lastIndexOf('\\') + 1
    }
        
    let subs2 = ''
    if(index2 != 0){
        subs2 = dir.substr(index2,dir.length - index2)
    } else {
        subs2 = dir
    }
    addFileList(subs2,dir,data)
    document.title = dir + ' ' + ourname
}

/**
 * 关闭编辑器
 */
function closeFile() {

    let nowid = listid.indexOf(now_id)
    textlist[now_id] = editor.getValue()
    var i = 0;
    for(i = 0; i < listid.length; i++){
        if(textlist[i] != contentlist[i])
            break;
    }
    if(i == listid.length) {
        ipcRenderer.send('reqaction', 'canclose');
    } else {
        closeFileById(listid[i])
    }
}

/**
 * 打开文件夹
 */
function openDir(){
    console.log('打开文件夹中...')
    files = dialog.showOpenDialogSync({
        title:"打开文件",                               //　对话框名称
        buttonLabel:'就是你了',                         //　对话框选择名称
        properties:['openDirectory'],
        filters:[        
            {name:'All Files', extensions:['*']},  //　针对不同文件的过滤器
        ]
    })
    openfileshow(files[0])
}

/**
 * 读取文件夹内容
 * @param {String} dir 
 */
function openfileshow(dir){
    now_dirname = dir                                       // 修改当前文件夹目录
    var editor_file = document.getElementById("editor-dir")
    editor_file.innerHTML=dir                               // 左上角显示当前文件夹路径
    filelist.innerHTML = ""
    
    fs.readdir(dir,(err,files) =>{                          // 读取文件夹
        files.forEach((file)=>{           
            var str =  dir + "/" + file;
            isfile = true
            fs.stat(str,(err,stats) => {
                if(stats.isFile())                          // 判断是文件还是文件夹
                    isfile = true                           // 是文件
                else 
                    isfile = false                          // 是文件夹
                if(isfile){                                 // 文件情况
                    var x = document.createElement('li')
                    var t = document.createTextNode(file)
                    x.style.color = "#00FFFF"
                    x.appendChild(t)
                    x.onmouseover = function(){
                        this.style.cursor = 'pointer';
                     
                    }
                    x.onclick = function(){
                        readfile(str)               // 左键点击读取文件
                    }
                    x.onmousedown = function(e){    // 右键点击删除文件
                        if(e.button == 2){
                            dialog.showMessageBox(
                                {
                                    message:'你需要删除文件 ' +file+' 吗？',
                                    type:'question',
                                    buttons:['是','否']
                                }
                            ).then((index2) =>{
                                if(index2.response===0){
                                    fs.unlink(str,function(){})
                                    openfileshow(now_dirname)
                                } 
                            })
                            openfileshow(now_dirname)
                        }
                    }
                    filelist.appendChild(x)
                }
                else {                                      // 文件夹情况
                    var lili = document.createElement('li')
                    var divs = document.createElement("div")
                    lili.onmouseover = function(){
                        this.style.cursor = "pointer"
                    }
                    var y = document.createElement('label')
                    y.setAttribute("for","dir"+listnum)

                    var x = document.createElement('input')
                    x.type = 'checkbox'
                    x.setAttribute("id","dir" + listnum)
                    x.style.display = "none"
                    x.onmouseover = function(){
                        this.style.cursor = "pointer"
                    }
                    
                    x.onclick = function(){
                        var uull = document.getElementById("list"+listnum)
                        if(uul.style.display == '')
                            uul.style.display = 'none'
                        else 
                            uul.style.display = ''
                    }
                    var t = document.createTextNode(file)
                    var uul = document.createElement("ul")
                    uul.setAttribute("id","list"+listnum)
                    uul = getlist(str)
                    uul.style.display = 'none'

                    y.appendChild(t)
                    divs.appendChild(y)
                    divs.appendChild(x)
                    divs.appendChild(uul)
                    lili.appendChild(divs)

                    filelist.appendChild(lili)
                    listnum = listnum + 1
                }
            })
        })
    })
}

function getlist(dir) {
    var ul = document.createElement("ul");
    ul.innerHTML = ""
    fs.readdir(dir,(err,files) =>{
        files.forEach((file)=>{
            var str =  dir + "/" + file;
            isfile = true
            fs.stat(str,(err,stats) => {
                if(!err){
                    if(stats.isFile())
                    isfile = true
                else 
                    isfile = false
                if(isfile){
                    var x = document.createElement('li')
                    var t = document.createTextNode(file)
                    x.appendChild(t)
                    x.style.color = "#00FFFF"
                    x.onmouseover = function(){
                        this.style.cursor = 'pointer';
                    }
                    x.onclick = function(){
                        readfile(str)
                    }
                    x.onmousedown = function(e){
                        
                        if(e.button == 2){
                            dialog.showMessageBox(
                                {
                                    message:'你需要删除文件 ' +file+' 吗？',
                                    type:'question',
                                    buttons:['是','否']
                                }
                            ).then((index2) =>{
                                if(index2.response===0){
                                    fs.unlink(str,function(){})
                                    openfileshow(now_dirname)
                                } 
                            })
                            openfileshow(now_dirname)
                        }
                    }
                    ul.appendChild(x)
                }
                else {
                    var lili = document.createElement('li')
                    var divs = document.createElement("div")
                    lili.onmouseover = function(){
                        this.style.cursor = "pointer"
                    }
                    var y = document.createElement('label')
                    y.setAttribute("for","dir"+listnum)

                    var x = document.createElement('input')
                    x.type = 'checkbox'
                    x.setAttribute("id","dir" + listnum)
                    x.style.display = "none"
                    x.onmouseover = function(){
                        this.style.cursor = "pointer"
                    }
                    x.onclick = function(){
                        var uull = document.getElementById("list"+listnum)
                        if(uul.style.display == '')
                            uul.style.display = 'none'
                        else 
                            uul.style.display = ''
                    }
                    var t = document.createTextNode(file)
                    var uul = document.createElement("ul")
                    uul.setAttribute("id","list"+listnum)
                    uul = getlist(str)
                    uul.style.display = 'none'

                    y.appendChild(t)
                    divs.appendChild(y)
                    divs.appendChild(x)
                    divs.appendChild(uul)
                    lili.appendChild(divs)

                    ul.appendChild(lili)
                    listnum = listnum + 1
                }
                }
                
            })
        })
    })
    return ul
}
/**
 * 查找
 */
function find(){
    editor.execCommand('find') 
}

/**
 * 查找下一个
 */
function findNext(){
    editor.execCommand('findNext') 
}

/**
 * 查找上一个
 */
function findPrev(){
    editor.execCommand('findPrev') 
}

/**
 * 替换
 */
function replace(){
    editor.execCommand('replace') 
}

/**
 * 全部替换
 */
function replaceAll(){
    editor.execCommand('replaceAll') 
}

/**
 * 和主进程通信(编码)
 */
ipcRenderer.on('encode', (event,arg)=>{
    switch(arg){
        case 'unicode':
            switchEncode("utf16le")
            break
        case 'utf8':
            switchEncode("utf8")
            break
        case 'ansi':
            switchEncode("gbk")
            break
    }
})

function switchEncode(endoceType){
        var index1 = listid.indexOf(now_id)
        currentFile = dirlist[index]
        let data=fs.readFileSync(currentFile, 'binary')
        data =iconv.decode(data,endoceType)
        txtEditor.value =data
        editor.setValue(txtEditor.value)
}

/**
 * 和主进程通信(编码转换)
 */
ipcRenderer.on('changeEncode', (event,arg)=>{
    switch(arg){
        case 'unicode':
            convertEncodeFile("utf16le")
            break
        case 'utf8':
            convertEncodeFile("utf8")
            break
        case 'ansi':
            convertEncodeFile("gbk")
            break
    }
})

function convertEncodeFile(encodeType){
    var index1 = listid.indexOf(now_id)
    currentFile = dirlist[index]
    let data=iconv.encode(txtEditor.value,encodeType)
    fs.writeFileSync(currentFile, data, "binary");
    switchEncode(encodeType)
}

/**
 * 和主进程通信(编译)
 */
ipcRenderer.on('compiler', (event,arg)=>{
    switch(arg){
        case 'run':
            run()
            break
    }
})

var exec = require('child_process').exec; 

function run(){
    var index1 = listid.indexOf(now_id)
    currentFile = dirlist[index1]
    openT.openTerminalFlag()
    openT.termEcho("程序正在运行")
    var op = "g++";
    //获取当前路径最后的“.”
    var index1 = currentFile.lastIndexOf(".");
    //获取源文件除后缀
    var source = currentFile.substring(0, index1);
    //编译命令
    var command_1 = op.concat(" ", currentFile, " -o", source);
    //目标生成的exe文件
    var target = source.concat(".exe"); 
    //执行命令
    var op_2 = "start";
    //执行生成的exe文件
    var command_2 = op_2.concat(" ", source);
    var flag;

    fs.exists(target, function(exists) { //判断exe文件是否存在
        flag = exists ? true : false;
        if(flag){
            //如果存在，为确保改动一致，删除现有exe文件
            fs.unlinkSync(target);
        }

        //g++ currentFile -o targetFile
        exec(command_1, function(err,stdout, stderr){
        if(err) {
            console.log('Compiler error:');
            openT.termEcho("Compiler error:");
            console.log(stderr);
            openT.termEcho(stderr);
        } else {  
            //执行exe程序 
            exec(command_2, function(err, stdout, stderr) {
                if(err) {
                    console.log('Runtime error:');
                    openT.termEcho("Runtime error:");
                    console.log(stderr);
                    openT.termEcho(stderr);
                }
                else {
                    console.log('Program end:');
                    openT.termEcho("Program end");
                    console.log(stdout);
                    openT.termEcho(stdout);
                }
            }); 
            }
        });
    });
}