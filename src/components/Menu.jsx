/**
 * Created by clakeboy on 2019/1/18.
 */
import React from 'react';
import '../assets/css/menu.less';
import MoEvent from "../common/Event";
import {Tree,Load} from "@clake/react-bootstrap4";
// import {Tree,Load} from "../../../react-bootstrap-v4/src/index";
import Fetch from "../common/Fetch";
import {CONNECT_SERVER, GET_DATA} from "../common/Events";

class Menu extends React.Component {
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

    clickHandler = (e,item,id)=>{

    };

    doOpen = (menu) => {
        switch (menu.type) {
            case "collection":
                MoEvent.emit(GET_DATA,menu.data);
                break;
            case "indexed":
                break;
        }
        return menu.type !== 'collection';
    };

    render() {
        if (this.state.loading) {
            return this.renderLoading();
        }
        return (
            <div className='moogo-menu' onContextMenu={(e)=>{e.preventDefault()}}>
                {this.state.serverList.length > 0?this.renderServerTree():this.renderEmpty()}
            </div>
        );
    }

    renderLoading() {
        return <>
            <Load/>
        </>
    }

    renderEmpty() {
        return <>
            <div className='text-center mt-3'>没有连接的服务器</div>
        </>
    }

    renderServerTree() {
        return this.state.serverList.map((tree)=>{
            return <Tree data={tree} onClick={(e,item,id)=>{

            }} onDbClick={this.doOpen}/>
        });
    }

    renderMenu() {
        return (<>
            <Menu ref={c=>this.serverMenu=c} onClick={(key)=>{
                console.log(key);
            }}>
                <Menu.Item field="copy" onClick={()=>{
                    console.log(document.execCommand("copy"))
                }}>Copy</Menu.Item>
                <Menu.Item step/>
                <Menu.Item field="asc">Asc</Menu.Item>
                <Menu.Item field="desc" onClick={(key)=>{
                    console.log("custom key");
                }}>Desc</Menu.Item>
                <Menu.Item step/>
                <Menu.Item field='select_filter' onClick={()=>{
                    let select = document.getSelection();
                    console.log(select.toString());
                }}>Filter Selection</Menu.Item>
                <Menu.Item field="filter">
                    <span className='mr-1'>Filter</span>
                    <Input size='xs' onMouseDown={(e)=>{e.stopPropagation();}}/>
                </Menu.Item>
                <Menu.Item field="filter" text='More...' child>
                    <Menu.Item>Child Menu 1</Menu.Item>
                    <Menu.Item>Child Menu 2</Menu.Item>
                    <Menu.Item>Child Menu 3</Menu.Item>
                </Menu.Item>
            </Menu>
        </>)
    }
}

Menu.propTypes = {

};

Menu.defaultProps = {

};

export default Menu;