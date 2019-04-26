/**
 * Created by clakeboy on 2019/1/22.
 */
import React from 'react';
import {
    Button, ButtonGroup,
    CKModal, Icon, LoaderComponent,
    Table,
    TableHeader,
} from '@clake/react-bootstrap4';
import {GetComponent} from "../../common/Funcs";
import Fetch from "../../common/Fetch";
import MoEvent from "../../common/Event";
import {CONNECT_SERVER} from "../../common/Events";

class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data:null
        };
    }

    componentDidMount() {
        this.loadData(1);
    }

    loadData(page) {
        page = page || 1;
        this.modal.loading('加载中...');
        Fetch("/serv/server/query",{
            name:'',
            page:page,
            number:10
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.setState({
                    data:res.data
                })
            } else {
                this.modal.alert("加载服务器列表出错! \n"+res.msg);
            }
        },(e)=>{
            this.modal.alert(e+"");
        });
    }

    closeModal = () => {
        this.modal.close();
        this.loadData(1);
    };

    addServer = () => {
        this.modal.view({
            title:'添加服务器',
            content:<LoaderComponent import={GetComponent} callback={this.closeModal} loadPath='/server/Edit'/>,
        });
    };

    editServer(row) {
        this.modal.view({
            title:'修改服务器 - '+row.name,
            content:<LoaderComponent import={GetComponent} serverId={row.id} callback={this.closeModal} loadPath='/server/Edit'/>,
        });
    };

    connectServer(row) {
        this.modal.loading('连接中...');
        MoEvent.emit(CONNECT_SERVER,row.id,(status,msg)=>{
            this.modal.close();
            if (status) {
                this.props.callback();
            } else {
                this.modal.alert(<>
                    <p>连接服务器失败!</p>
                    <p>{msg}</p>
                    </>
                );
            }
        })
    }

    deleteServer(row) {
        this.modal.confirm({
            title:'警告',
            content:<span>是否要删除服务器: <i className='text-danger'>{row.name}</i> ?</span>,
            callback:(flag)=>{
                if (flag === 1) {
                    this.modal.loading('删除服务器中...');
                    Fetch('/serv/server/delete',{id:row.id},(res)=>{
                        this.modal.close();
                        if (res.status) {
                            this.loadData(1);
                        } else {
                            this.modal.alert(<span>
                            <p>删除服务器失败!</p>
                            <p>{res.msg}</p>
                        </span>)
                        }
                    },(e)=>{
                        this.modal.alert(`${e}`);
                    })
                }
            }
        });
    }

    render() {
        return (
            <div>
                <div className='mb-1'>
                    <Button onClick={this.addServer}>添加服务器</Button>
                </div>
                <Table onRefresh={()=>{this.loadData(1)}} hover select={false} headerTheme='light' emptyText={<span style={{'fontSize':'1.25rem'}}>没有添加服务器</span>} data={this.state.data}>
                    <TableHeader text='服务器名称' field='name'/>
                    <TableHeader text='地址' field='address' onFormat={(val,row)=>{
                        return `${val}:${row.port}`;
                    }}/>
                    <TableHeader text='认证' align='center' field='is_auth' onFormat={(val,row)=>{
                        return val?<Icon className='text-success' icon='check-circle'/>:<Icon className='text-danger' icon='times-circle'/>
                    }}/>
                    <TableHeader text='SSH' align='center' field='is_ssh' onFormat={(val,row)=>{
                        return val?<Icon className='text-success' icon='check-circle'/>:<Icon className='text-danger' icon='times-circle'/>
                    }}/>
                    <TableHeader text='' align='right' onFormat={(val,row)=>{
                        return <ButtonGroup>
                            <Button icon='bolt' outline onClick={()=>{
                                this.connectServer(row);
                            }}/>
                            <Button icon='edit' theme='success' outline onClick={()=>{
                                this.editServer(row);
                            }}/>
                            <Button icon='trash-alt' theme='danger' onClick={()=>{
                                this.deleteServer(row);
                            }}/>
                        </ButtonGroup>
                    }}/>
                </Table>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

export default List;