/**
 * Created by clakeboy on 2019/1/18.
 */
import React from 'react';
import '../assets/css/menu.less';
import MoEvent from "../common/Event";
import {
    Tree,Load,Menu,Icon,Common
} from "@clake/react-bootstrap4";
// import {Tree,Load,Menu} from "../../../react-bootstrap-v4/src/index";
import Fetch from "../common/Fetch";
import {CONNECT_SERVER, GET_DATA} from "../common/Events";
import {CommonContext} from "../context/Common";

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
    }

    loadConnectServer() {
        this.setState({loading:true},()=>{
            Fetch('/serv/conn/active_connect',{},(res)=>{
                if (res.status && res.data) {
                    this.setState({serverList:res.data,loading:false})
                } else {
                    this.setState({loading:false})
                }
            },()=>{

            })
        })
    }

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

    refreshConnect = (e,field,data)=> {
        this.getModal();
        this.modal.loading('正在刷新服务器信息...');
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
                    <p>关闭服务器出错!</p>
                    <p>{res.msg}</p>
                </>);
            }
        },this.netWorkError)
    };

    openCollection = (e,field,data)=>{
        let tab_data = Object.assign({},data.serverInfo);
        tab_data.tab_id = Common.RandomString(8);
        MoEvent.emit(GET_DATA,tab_data);
    };

    doOpen = (menu) => {
        switch (menu.type) {
            case "collection":
                let tab_data = Object.assign({},menu.data);
                tab_data.tab_id = Common.RandomString(8);
                MoEvent.emit(GET_DATA,tab_data);
                break;
            case "indexed":
                break;
        }
        return menu.type !== 'collection';
    };

    netWorkError = (e) => {
        this.getModal();
        this.modal.alert(<>
            <p>访问网络出错!</p>
            <p>{e}</p>
        </>);
    };

    render() {
        if (this.state.loading) {
            return this.renderLoading();
        }
        return (
            <div className='moogo-menu' >
                {this.state.serverList.length > 0?this.renderServerTree():this.renderEmpty()}
                {this.renderMenu()}
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
                }
            }}/>
        });
    }

    renderMenu() {
        return (<>
            <Menu ref={c=>this.connectMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
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
                <Menu.Item step/>
                <Menu.Item field="open_collection" onClick={null}>
                    添加数据
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={null}>
                    克隆数据表
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={null}>
                    删除数据表
                </Menu.Item>
            </Menu>
            <Menu ref={c=>this.indexMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="open_collection" onClick={null}>
                    编辑索引
                </Menu.Item>
                <Menu.Item field="open_collection" onClick={null}>
                    删除索引
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