/**
 * Created by clakeboy on 2019/1/23.
 */
import React from 'react';
import {
    Tabs,
    TabsContent,
    Input,
    Button,
    ButtonGroup,
    Switch, Form, Modal
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

let emptyData = {
    id:0,
    name:'',
    address:'',
    port:'27017',
    is_auth:false,
    auth_database:'',
    auth_user:'',
    auth_password:'',
    is_ssh:false,
    ssh_address:'',
    ssh_port:'22',
    ssh_user:'',
    ssh_auth_method:'',
    ssh_password:''
};

class Edit extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data:Object.assign({},emptyData),
            is_auth:false,
            is_ssh:false,
            is_save:false,
            showTab:'server',
        };
        this.edit = false;
    }

    componentDidMount() {
        this.initEdit(this.props.serverId);
    }

    componentWillReceiveProps(nextProps) {
        this.initEdit(nextProps.serverId);
    }

    initEdit(serverId) {
        if (!serverId) {
            this.reNew();
            return
        }
        this.edit = true;
        this.modal.loading('加载中...');
        Fetch('/serv/server/find',{id:serverId},(res)=>{
            this.modal.close();
            if (res.status) {
                this.setState({
                    data:res.data,
                    is_auth:res.data.is_auth,
                    is_ssh:res.data.is_ssh
                })
            } else {
                this.modal.alert('加载信息出错',()=>{
                    this.props.callback();
                })
            }
        })
    }

    reNew() {
        this.edit = false;
        this.setState({
            data:Object.assign({},emptyData),
            is_auth:false,
            is_ssh:false,
            is_save:false,
        })
    }

    save = () => {
        this.modal.loading('保存中...');
        this.setSave();
        Fetch('/serv/server/edit',this.state.data,(res)=>{
            this.modal.close();
            if (res.status) {
                this.modal.alert('保存服务器信息成功!',()=>{
                    this.props.callback();
                });
            } else {
                this.modal.alert('保存服务器信息出错!');
            }
        },(err)=>{
            this.modal.alert(`连接服务器出错! ${err}`);
        });
    };

    setSave() {
        this.setState({is_save:!this.state.is_save});
    }

    testConnect = ()=>{
        if (!this.edit) {
            this.modal.alert("请先保存服务器信息,再进行连接测试");
            return
        }
        this.modal.loading('测试中...');
        Fetch('/serv/server/test_connect',{id:this.state.data.id},(res)=>{
            this.modal.close();
            if (res.status) {
                this.modal.alert('测试连接服务器成功!');
            } else {
                this.modal.alert(<>
                    <p>测试连接服务器出错!</p>
                    <p>{res.msg}</p>
                </>);
            }
        },(err)=>{
            this.modal.alert(`请求服务器出错! ${err}`);
        });
    };

    changeHandler = (field,val)=>{
        let data = Object.assign({},this.state.data);
        data[field] = val;
        this.setState({data:data});
    };

    render() {
        let data = this.state.data;
        return (
            <div>
                <Form onChange={this.changeHandler}>
                    <Tabs showTab={this.state.showTab} onSelect={(id)=>{this.setState({showTab:id})}}>
                        <TabsContent id='server' text='服务器'>
                            <div className="p-3">
                                <div className="form-row">
                                    <Input field='name' className='col' label='服务器名称' data={data.name}/>
                                </div>
                                <div className="form-row">
                                    <Input field='address' className='col-9' label='服务器IP地址' data={data.address}/>
                                    <Input field='port' className='col-3' label='服务器端口' data={data.port}/>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent id='auth' text='服务器验证'>
                            <div className="p-3">
                                <div className="form-row mb-3">
                                    <Switch field='is_auth' onChange={(check)=>{
                                        this.setState({
                                            is_auth:check
                                        });
                                    }} checked={this.state.is_auth}/><span className='ml-2'>是否使用验证</span>
                                </div>
                                <Input field='auth_database' label='验证数据库名' disabled={!this.state.is_auth} data={data.auth_database}/>
                                <Input field='auth_user' label='用户名' disabled={!this.state.is_auth} data={data.auth_user}/>
                                <Input field='auth_password' label='密码' type='password' disabled={!this.state.is_auth} data={data.auth_password}/>
                            </div>
                        </TabsContent>
                        <TabsContent id='ssh' text='SSH'>
                            <div className="p-3">
                                <div className="form-row mb-3">
                                    <Switch field='is_ssh' onChange={(check)=>{
                                        this.setState({
                                            is_ssh:check
                                        })
                                    }} checked={this.state.is_ssh}/><span className='ml-2'>是否使用SSH</span>
                                </div>
                                <div className="form-row">
                                    <Input field='ssh_address' className='col-9' label='服务器IP地址' disabled={!this.state.is_ssh} data={data.ssh_address}/>
                                    <Input field='ssh_port' className='col-3' label='服务器端口' disabled={!this.state.is_ssh} data={data.ssh_port}/>
                                </div>
                                <Input field='ssh_user' label='SSH 用户名' disabled={!this.state.is_ssh} data={data.ssh_user}/>
                                <Input field='ssh_password' label='SSH 密码' type='password' disabled={!this.state.is_ssh} data={data.ssh_password}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className='mt-3'>
                        <Button outline icon='plug' onClick={this.testConnect}>测试连接</Button>
                        <ButtonGroup className='float-right'>
                            <Button icon='save' disabled={this.state.is_save} onClick={this.save}>保存</Button>
                            <Button theme='secondary' outline onClick={()=>{
                                this.props.callback();
                            }}>取消</Button>
                        </ButtonGroup>
                    </div>
                </Form>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

export default Edit;