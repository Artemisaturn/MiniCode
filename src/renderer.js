const fs = require('fs')
const {dialog} = require('electron').remote
const {ipcRenderer} = require('electron')
const shell=require('shelljs')
const { exec } = require('child_process');
var child_process = require('child_process');
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
var path = require('path')
var terminalOpen=false
function getProcessInfo(){
    
    console.log("getUsage",process.getCPUUsage())
    console.log("arch",process.arch)
    console.log("env",process.env)
    console.log("platform",process.platform)
}

//　打开文件对话框
function openDialog(){
    const file = dialog.showOpenDialogSync({
        title:"打开文件",                               //　对话框名称
        buttonLabel:'就是你了',                         //　对话框选择名称
        properties:['openFile'],
        filters:[                                     //　针对不同文件的过滤器
            {name:'Image', extensions:['jpg', 'png', 'gif']},
            {name:'Moive', extensions:['mp4','avi','mkv']},
            {name:'All Files', extensions:['*']}
        ]
    })
    console.log(file)
}

function saveDialog(){
    console.log('********保存')
    file = dialog.showSaveDialogSync({
        title:"保存文件",
        buttonLabel:'保存',
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
            { name: 'Custom File Type', extensions: ['as'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    })
    console.log(file)
    fs.writeFileSync(file,'保存成功！！')
}

ipcRenderer.on('on-terminal', (event,arg)=>{
    switch(arg){
        case 'openTerminal':
            openTerminal();
            break
        case 'closeTerminal':
            closeTerminal()
            break    
        case 'showTerminal':
            showTerminal()
            break
        case 'hideTerminal':
            hideTerminal();
            break

    }
})
var term=null
exports.termEcho=function EchoData(data){
    term.echo(data)
}
exports.openTerminalFlag=function openTermForCompiler(){
    openTerminal()
}
function openTerminal(){
    terminalOpen=true
    document.getElementById("terminal_zone").style.display="";//显示
    let curDir=__dirname
     term = $('#terminal_zone').terminal(
        function(command) {
            command=command.replace(/(^\s*)|(\s*$)/g,"")
            if (command.match("cd")) {

                if(command==='cd ..'){
                    // term.echo("old:"+curDir)
                    curDir=path.resolve(curDir, '..')
                    // term.echo("new:"+curDir)
                }else if(command==='cd'){
                    term.echo(curDir)
                }else{
                    var commandArr=command.split(/[ ]+/)
                    let resolvedPath=path.resolve(curDir,commandArr[1])
                    fs.exists(resolvedPath,function(exists){
                        if(exists){
                            curDir=resolvedPath
                            term.set_prompt(function(set_prompt) {
                                set_prompt(curDir.replace(/[\r\n]/g,"")+">")
                            });   
                        }
                        if(!exists){
                            term.echo("路径"+resolvedPath+"不存在！")
                        }
                   })
                }
                term.set_prompt(function(set_prompt) {
                    set_prompt(curDir.replace(/[\r\n]/g,"")+">")
                });   
            } else if (command !== '') {
                child_process.exec(command, 
                    {   encoding: binaryEncoding ,
                         cwd: curDir
                    }, 
                    function(err, stdout, stderr){
                    let echoout=iconv.decode(new Buffer(stdout, binaryEncoding), encoding)
                    let echoError=iconv.decode(new Buffer(stderr, binaryEncoding), encoding)
                    term.echo(echoout)
                    term.echo(echoError)
                    term.set_prompt(function(set_prompt) {
                        set_prompt(curDir.replace(/[\r\n]/g,"")+">")
                    });        
                });
            }
        }, 
        {
            exit: false,
            greetings: "Welcome to Mini Code Terminal!",
            name: 'electron',
            prompt: '[[;#D72424;]js]> '
        }
    );

    term.set_prompt(function(set_prompt) {
        set_prompt(curDir.replace(/[\r\n]/g,"")+">")
    });
}

function hideTerminal(){
    document.getElementById("terminal_zone").style.display="none";
}

function showTerminal(){

    if(terminalOpen){
        document.getElementById("terminal_zone").style.display="";//显示
    }
}

function closeTerminal(){
    document.getElementById("terminal_zone").style.display="none";  
    terminalOpen=false
}