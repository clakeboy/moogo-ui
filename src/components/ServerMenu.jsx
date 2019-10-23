/**
 * Created by clakeboy on 2019/1/18.
 */
import React from 'react';
import '../assets/css/menu.less';
import MoEvent from "../common/Event";
import {
    Tree,Load,Menu,Icon,Common,LoaderComponent,Scroll
} from "@clake/react-bootstrap4";
// import {Tree,Load,Menu} from "../../../react-bootstrap-v4/src/index";
import Fetch from "../common/Fetch";
import {CONNECT_SERVER, GET_DATA} from "../common/Events";
import {CommonContext} from "../context/Common";
import {GetComponent} from "../common/Funcs";

class ServerMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            serverList:[],
            loading:false
        };

        this.count = 0;
    }

    componentDidMount() {
        MoEvent.on(CONNECT_SERVER,this.connectServer);
        this.loadConnectServer()
    }

    componentWillUnmount() {
        MoEvent.off(CONNECT_SERVER,this.connectServer)
    }

    getModal() {
        if (!this.modal) {
            this.modal = this.context.modal();
        }
        return this.modal;
    }
    //加载可连接的服务器列表
    loadConnectServer() {
        this.setState({loading:true},()=>{
            Fetch('/serv/conn/active_connect',{},(res)=>{
                if (res.status && res.data) {
                    this.setState({serverList:res.data,loading:false})
                } else {
                    this.setState({loading:false})
                }
            },(e)=>{
                this.setState({loading:false})
            })
        })
    }
    //连接服务器
    connectServer = (type,server_id,cb)=>{
        Fetch('/serv/conn/connect',{server_id:server_id},(res)=>{
            if (res.status) {
                let list = this.state.serverList;
                list.push(res.data);
                this.setState({
                    serverList:list
                })
            }
            cb(res.status,res.msg);
        },(e)=>{
            cb(false,`${e}`);
        })
    };
    //关闭已连接的服务器
    closeConnect = (e,field,data) => {
        this.getModal();
        this.modal.loading('正在关闭连接中...');
        let server_id = data.serverInfo.id;
        Fetch('/serv/conn/close_connect',{server_id:server_id},(res)=>{
            this.modal.close();
            if (res.status) {
                let list = this.state.serverList.slice();
                list.splice(this.connectMenu.data.serverIndex,1);
                this.setState({
                    serverList:list
                })
            } else {
                this.modal.alert(<>
                    <p>关闭服务器出错!</p>
                    <p>{res.msg}</p>
                </>);
            }
        },(e)=>{
            this.modal.alert(<>
                <p>访问网络出错!</p>
                <p>{e}</p>
            </>);
        })
    };
    //刷新服务器列表
    refreshConnect = (e,field,data)=> {
        this.getModal().loading('正在刷新服务器信息...');
        Fetch('/serv/conn/refresh',{server_id:data.serverInfo.id},(res)=>{
            if (res.status) {
                this.modal.close();
                let list = this.state.serverList.slice();
                list.splice(data.serverIndex,1,res.data);
                this.setState({
                    serverList:list
                })
            } else {
                this.modal.alert(<>
                    <p>刷新服务器出错!</p>
                    <p>{res.msg}</p>
                </>);
            }
        },this.netWorkError)
    };
    //创建数据库
    createDatabase = (e,field,data) => {
        this.getModal().view({
            title:'新建数据库',
            size:'def',
            content:<LoaderComponent import={GetComponent} conn={data.serverInfo} data={this.state.serverList[data.serverIndex]} callback={(update)=>{
                this.getModal().close();
                if (update) {
                    this.setState({
                        serverList:this.state.serverList
                    })
                }
            }} loadPath='/database/Create'/>,
        });
    };
    //删除数据库
    deleteDatabase = (e,field,data) => {
        this.getModal().confirm({
            title:'警告',
            content: `是否真的要数据库 Database: ${data.serverInfo.database} ?`,
            callback: (ok)=>{
                if (!ok) return false;
                this.getModal().loading('删除数据库中...');
                Fetch('/serv/database/drop',{
                    server_id: data.serverInfo.server.id,
                    database: data.serverInfo.database
                },(res)=>{
                    if (res.status) {
                        this.getModal().alert(`删除数据库 ${data.serverInfo.database} 成功!`,()=>{
                            this.refreshConnect(null,null,{
                                serverInfo:data.serverInfo.server,
                                serverIndex:data.serverIndex,
                            });
                        });
                    } else {
                        this.getModal().alert(<>
                            <p>{`删除数据库 ${data.serverInfo.collection} 出错!`}</p>
                            <p>{res.msg}</p>
                        </>);
                    }
                },this.netWorkError)
            }
        });
    };
    //打开文档集合
    openCollection = (e,field,data)=>{
        let tab_data = Object.assign({},data.serverInfo);
        tab_data.tab_id = Common.RandomString(8);
        MoEvent.emit(GET_DATA,tab_data);
    };
    //克隆文档
    cloneCollection = (e,field,data) => {
        this.getModal().view({
            title:'克隆数据',
            close:false,
            content:<LoaderComponent import={GetComponent} src={data.serverInfo} callback={(refresh)=>{
                this.getModal().close();
                if (refresh) {
                    this.refreshConnect(null,null,{
                        serverInfo:data.serverInfo.server,
                        serverIndex:data.serverIndex,
                    })
                }
            }} loadPath='/clone/Collection'/>,
        });
    };
    //删除文档集合
    deleteCollection = (e,field,data) => {
        this.getModal().confirm({
            title:'警告',
            content: `是否真的要删除 Collection: ${data.serverInfo.collection} ?`,
            callback: (ok)=>{
                if (!ok) return false;
                this.getModal().loading('删除文档集合中...');
                Fetch('/serv/coll/delete',{
                    server_id: data.serverInfo.server.id,
                    database: data.serverInfo.database,
                    collection: data.serverInfo.collection,
                },(res)=>{
                    if (res.status) {
                        this.getModal().alert(`删除文档集合 ${data.serverInfo.collection} 成功!`,()=>{
                            this.refreshConnect(null,null,{
                                serverInfo:data.serverInfo.server,
                                serverIndex:data.serverIndex,
                            });
                        });
                    } else {
                        this.getModal().alert(`删除文档集合 ${data.serverInfo.collection} 失败!`);
                    }
                },this.netWorkError)
            }
        });
    };
    //树菜单双击功能
    doOpen = (tree) => {
        switch (tree.type) {
            case "collection":
                let tab_data = Object.assign({},tree.data);
                tab_data.tab_id = Common.RandomString(8);
                MoEvent.emit(GET_DATA,tab_data);
                break;
            case "indexed":
                break;
        }
        return tree.type !== 'collection'; //返回false停止执行树菜单展开动作
    };
    //添加索引
    addIndex = (e,field,data) => {
        this.getModal().view({
            title:'添加索引',
            content:<LoaderComponent import={GetComponent} data={data.serverInfo} isAdd={true} callback={()=>{
                this.getModal().close();
            }} loadPath='/index/IndexEdit'/>,
        });
    };
    //编辑索引
    editIndex = (e,field,data) => {
        this.getModal().view({
            title:'编辑索引',
            content:<LoaderComponent import={GetComponent} data={data.serverInfo} isAdd={false} callback={()=>{
                this.getModal().close();
            }} loadPath='/index/IndexEdit'/>,
        });
    };
    //删除索引
    deleteIndex = (e,field,data) => {
        console.log(data);
        this.getModal().confirm({
            content:<span>确定要删除[<span className='text-danger'>{data.serverInfo.index}</span>]索引?</span>,
            callback:(flag)=>{
                if (flag === 1) {
                    this.getModal().loading('正在删除索引...');
                    Fetch('/serv/index/delete',{
                        server_id:data.serverInfo.server.id,
                        database:data.serverInfo.database,
                        collection:data.serverInfo.collection,
                        name:data.serverInfo.index
                    },(res)=>{
                        this.getModal().close();
                        if (res.status) {
                            this.getModal().alert('删除索引成功!');
                        } else {
                            this.getModal().alert(`删除索引出错!: ${res.msg}`);
                        }
                    },this.netWorkError);
                }
            }
        });
    };
    //导出bson
    exportBson = (e,field,data) => {
        this.getModal().view({
            title:'导出数据 Bson',
            close:false,
            content:<LoaderComponent import={GetComponent} conn={data.serverInfo} callback={()=>{
                this.getModal().close();
            }} loadPath='/export/Bson'/>,
        });
    };
    //导入
    importData = (e,field,data) => {
        this.getModal().view({
            title:'数据导入',
            close:false,
            content:<LoaderComponent import={GetComponent} conn={data.serverInfo} callback={(refresh)=>{
                this.getModal().close();
                if (refresh) {
                    this.refreshConnect(null,null,{
                        serverInfo:data.serverInfo.server,
                        serverIndex:data.serverIndex,
                    })
                }
            }} loadPath='/import/Bson'/>,
        });
    };
    //创建文档集合 collection
    createCollection = (e,field,data) => {
        this.getModal().view({
            title:'创建文档集合',
            size:'def',
            content:<LoaderComponent import={GetComponent} conn={data.serverInfo} callback={(refresh)=>{
                this.getModal().close();
                this.refreshConnect(null,null,{
                    serverInfo:data.serverInfo.server,
                    serverIndex:data.serverIndex,
                })
            }} loadPath='/collection/Create'/>,
        });
    };
    //添加文档
    addData = (e,field,data) => {
        this.getModal().view({
            title:'添加数据',
            content:<LoaderComponent import={GetComponent} conn={data.serverInfo} mode='add' callback={()=>{
                this.getModal().close();
            }} loadPath='/data/DataEdit'/>,
        });
    };
    netWorkError = (e) => {
        this.getModal().alert(<>
            <p>访问网络出错!</p>
            <p>{e}</p>
        </>);
    };

    render() {
        if (this.state.loading) {
            return this.renderLoading();
        }
        return (
            <div className='moogo-menu'>
                <div className='moogo-menu-content' >
                    {this.state.serverList.length > 0?this.renderServerTree():this.renderEmpty()}
                    {this.renderMenu()}
                </div>
                <Scroll selector='.moogo-menu-content'/>
            </div>
        );
    }

    renderLoading() {
        return <>
            <div className='moogo-menu'>
                <div className='text-center mt-3'>
                    <Load/>
                </div>
            </div>
        </>
    }

    renderEmpty() {
        return <>
            <div className='text-center mt-3'>没有连接的服务器</div>
        </>
    }

    renderServerTree() {
        return this.state.serverList.map((tree,idx)=>{
            return <Tree data={tree} onDbClick={this.doOpen} onMenu={(e,item,id)=>{
                e.preventDefault();
                if (item.type === 'server') {
                    this.connectMenu.show({evt:e,type:'mouse',data:{
                        serverIndex:idx,
                        serverInfo:item.data
                    }});
                } else if (item.type === 'collection') {
                    this.collectionMenu.show({evt:e,type:'mouse',data:{
                        serverIndex:idx,
                        serverInfo:item.data
                    }});
                } else if (item.type === 'index') {
                    this.indexMenu.show({evt:e,type:'mouse',data:{
                        serverIndex:idx,
                        serverInfo:item.data
                    }});
                } else if (item.type === 'database') {
                    this.dbMenu.show({evt:e,type:'mouse',data:{
                        serverIndex:idx,
                        serverInfo:item.data
                    }});
                }
            }}/>
        });
    }

    renderMenu() {
        return (<>
            <Menu ref={c=>this.connectMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="refresh" onClick={this.createDatabase}>
                    <Icon className='pr-1' icon='plus'/>
                    新建数据库
                </Menu.Item>
                <Menu.Item field="refresh" onClick={this.refreshConnect}>
                    <Icon className='pr-1' icon='sync-alt'/>
                    刷新服务器
                </Menu.Item>
                <Menu.Item step/>
                <Menu.Item field="close" onClick={this.closeConnect}>
                    <Icon className='pr-1' icon='unlink'/>
                    关闭服务器连接
                </Menu.Item>
            </Menu>
            <Menu ref={c=>this.collectionMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="open_collection" onClick={this.openCollection}>
                    打开数据列表
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={this.cloneCollection}>
                    克隆数据表
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={this.deleteCollection}>
                    删除数据表
                </Menu.Item>
                <Menu.Item step/>
                <Menu.Item field="open_collection" onClick={this.addData}>
                    添加数据
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={this.addIndex}>
                    添加索引
                </Menu.Item>
            </Menu>
            <Menu ref={c=>this.indexMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="open_collection" onClick={this.editIndex}>
                    编辑索引
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={this.deleteIndex}>
                    删除索引
                </Menu.Item>
            </Menu>
            <Menu ref={c=>this.dbMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="add_database" onClick={this.createCollection}>
                    添加数据集合
                </Menu.Item>
                <Menu.Item field="drop_database" onClick={this.deleteDatabase}>
                    删除数据库
                </Menu.Item>
                <Menu.Item step/>
                <Menu.Item field="import_database" onClick={this.importData}>
                    导入数据
                </Menu.Item>
                <Menu.Item field="export_database" text='导出数据' child>
                    <Menu.Item onClick={this.exportBson}>导出 bson</Menu.Item>
                    <Menu.Item onClick={null}>导出 csv</Menu.Item>
                </Menu.Item>
            </Menu>
        </>)
    }
}

ServerMenu.propTypes = {

};

ServerMenu.defaultProps = {

};

ServerMenu.contextType = CommonContext;

export default ServerMenu;