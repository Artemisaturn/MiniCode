const {  app, BrowserWindow,globalShortcut,ipcMain, Menu} = require('electron')
const process = require('process')
const path = require('path')
const fs = require('fs')

let window 
let safeExit = false
//let filelist = document.getElementById("filelist")
/**
 * 　创建窗口 */
function createWindow(){
  window = new BrowserWindow({
    width: 800, 
    height: 600,
    show: false,
    
    webPreferences:{
      nodeIntegration:true, // 添加nodeIntegration 内容才可以在html和渲染JS中使用 !!!!!
      preload: path.join(__dirname, './renderer.js'),
    }
  })
  
  //　加载ＨＴＭＬ页面
  window.loadURL('file://' + __dirname + '/index.html')

  //　窗口关闭时调用
  window.on('close', (e) => {
    if(!safeExit){
      e.preventDefault();
      window.webContents.send('action','closefile');
    }
    //app.exit()
  })

  //　窗口关闭后调用
  window.on('closed', () => {
    window = null;
  })

  window.once('ready-to-show',()=> {
    window.show()
  })
  //　界面加载开时调用
  window.webContents.on('did-finish-load', ()=> {
    console.log('*********did-finish-load*************')
    fs.readdir(__dirname,(err,files)=>{
      files.forEach((file)=>{
        console.log(file)
      })
    })
    window.webContents.send('action','openfileshow')
  })
}

/*　设计菜单栏 */
function setMenu() {
  const templete = [
    {
      label: '文件',
      submenu: [
		
        {
          label: '新建文件',
          accelerator:'CommandOrControl+shift+n',
          click() { 
            //　发送消息newfile　需要dealfile.js响应
            window.webContents.send('action', 'newfile')
          },
        },
        {
          label: '打开文件',
          accelerator: 'CommandOrControl+o',
          click() { 
            window.webContents.send('action', 'openfile')
          },
        },
        {
          label: '打开文件夹',
          accelerator: 'ctrl + shift + o',
          click() {
            window.webContents.send('action', 'opendir')
          },
        },
        {
          label: '保存',
          accelerator:'CommandOrControl+s',
          click() {
            window.webContents.send('action', 'savefile')
          },
        },
        {
          label: '另外存',
          accelerator:'CommandOrControl+shift+s',
          click(){
            window.webContents.send('action', 'saveinoterfile')
          }
        },
        {
          type: 'separator',  // 分割线
        },
        {
          label: '打印',
          click() { },
        },
        {
          label: '退出',
          accelerator: 'CommandOrControl+q',
          click() {
            window.webContents.send('action','closefile') 
            app.quit()
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CommandOrControl+z',
          role: 'undo',
        },
        {
          label: '恢复',
          accelerator: 'CommandOrControl+y',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          label: '复制',
          accelerator: 'CommandOrControl+c',
          role: 'copy',
        },
		{
          label: '剪切',
          accelerator: 'CommandOrControl+x',
          role: 'cut',
        },
        {
          label: '粘贴',
          accelerator: 'CommandOrControl+v',
          role: 'paste',
        },

        {
          label: '删除',
          role: 'delete',
        },
        {
          label: '全选',
          role: 'selectall',
        },
      ],
    },
	{
		label: '查找',
		submenu: [
        {
          label: '查找',
		      accelerator: 'CommandOrControl+f',
          click() {      
            window.webContents.send('action','find')
		      },
        },
        {
          label: '下一个',
          accelerator: 'CommandOrControl+g',
          click() { 
            window.webContents.send('action','findNext')
          },
        },
        {
          label: '上一个',
          accelerator: 'CommandOrControl+h',
          click() { 
            window.webContents.send('action','findPrev')           
          },
        },
        {
          label: '替换',
          accelerator: 'shift+CommandOrControl+f',
          click() { 
            window.webContents.send('action','replace')
          },       
        },
		    {
          label: '替换全部',
          accelerator: 'shift+CommandOrControl+r',
          click() { 
            window.webContents.send('action','replaceAll')
          },         
        },
      ],
	
	}, 
  {
    label:'编码',
    submenu:[
      {
        label:'unicode打开',
        click(){
          window.webContents.send('encode','unicode')
        }
      },
      {
        label:'ansi打开',
        click(){
          window.webContents.send('encode','ansi')
        }
      },
      {
        label:'utf8打开',
        click(){
          window.webContents.send('encode','utf8')
        }
      },
      {
        type: 'separator', 
      },
      {
        label:'转换为utf8编码',
        click(){
          window.webContents.send('changeEncode','utf8')
        }
      },
      {
        label:'转换为ansi编码',
        click(){
          window.webContents.send('changeEncode','ansi')
        }
      },
      {
        label:'转换为unicode编码',
        click(){
          window.webContents.send('changeEncode','unicode')
        }
      },
    ],
  },
  {
    label:'编译',
    submenu:[
      {
        label:'启动运行',
        accelerator: 'f5',
        click(){
          window.webContents.send('compiler','run')
        }
      },
    ],
  },
	{
    label:'终端',
    submenu:[
      {
        label:'打开终端',
        accelerator: 'shift+CommandOrControl+`',
        click(){
          window.webContents.send('on-terminal','openTerminal')
        },
      },
      {
        label:'关闭终端',
        click(){
          window.webContents.send('on-terminal','closeTerminal')
        }
      },
      {
        label:'显示终端',
        click(){
          window.webContents.send('on-terminal','showTerminal')
        }
      },
      {
        label:'隐藏终端',
        click(){
          window.webContents.send('on-terminal','hideTerminal')
        }
      },

    ],

  },
  {
    label:'开发者工具',
    role:'toggleDevTools'
  }
	
  ]
  if(process.platform='darwin'){
    const name='mini code';
    templete.unshift({label:name});
  }
  const menu = Menu.buildFromTemplate(templete)
  Menu.setApplicationMenu(menu)
}

//　程序开始时调用
app.on('ready', ()=> {
  createWindow()
  // 快捷键的注册

  setMenu()
  app.addRecentDocument('file://' + __dirname +'/index.html')
  //　创建新的窗口
  
})



//　程序结束时调用
app.on('window-all-closed', ()=>{
  console.log('************window-all-closed**************')
  globalShortcut.unregisterAll()
  if(process.platform !== 'darwin') app.quit()
})

// 主进程和渲染进程通信
ipcMain.on('reqaction',(event,arg)=>{
  switch(arg){
    case 'canclose':
      console.log('***********close')
      safeExit = true
      app.quit()
      break
  }
})