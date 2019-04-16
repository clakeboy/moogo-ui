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
    Switch
} from '@clake/react-bootstrap4';

let emptyData = {
    id:0,
    name:'',
    address:'',
    port:'',
    is_auth:0,
    auth_database:'',
    auth_user:'',
    auth_password:'',
    is_ssh:0,
    ssh_address:'',
    ssh_port:'',
    ssh_user:'',
    ssh_auth_method:'',
    ssh_password:''
};

class Edit extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            data:{},
            is_auth:false,
            is_ssh:false
        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <Tabs>
                    <TabsContent id='server' text='服务器'>
                        <div className="p-3">
                            <div className="form-row">
                                <Input className='col' label='服务器名称'/>
                            </div>
                            <div className="form-row">
                                <Input className='col-9' label='服务器IP地址'/>
                                <Input className='col-3' label='服务器端口'/>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent id='auth' text='服务器验证'>
                        <div className="p-3">
                            <div className="form-row mb-3">
                                <Switch onChange={(check)=>{
                                    this.setState({
                                        is_auth:check
                                    });
                                }} checked={this.state.is_auth}/><span className='ml-2'>是否使用验证</span>
                            </div>
                            <Input label='验证数据库名' disabled={!this.state.is_auth}/>
                            <Input label='用户名' disabled={!this.state.is_auth}/>
                            <Input label='密码' type='password' disabled={!this.state.is_auth}/>
                        </div>
                    </TabsContent>
                    <TabsContent id='ssh' text='SSH'>
                        <div className="p-3">
                            <div className="form-row mb-3">
                                <Switch onChange={(check)=>{
                                    this.setState({
                                        is_ssh:check
                                    })
                                }} checked={this.state.is_ssh}/><span className='ml-2'>是否使用SSH</span>
                            </div>
                            <div className="form-row">
                                <Input className='col-9' label='服务器IP地址' disabled={!this.state.is_ssh}/>
                                <Input className='col-3' label='服务器端口' disabled={!this.state.is_ssh}/>
                            </div>
                            <Input label='SSH 用户名' disabled={!this.state.is_ssh}/>
                            <Input label='SSH 密码' type='password' disabled={!this.state.is_ssh}/>
                        </div>
                    </TabsContent>
                </Tabs>
                <div className='mt-3'>
                    <Button outline icon='plug'>测试连接</Button>
                    <ButtonGroup className='float-right'>
                        <Button icon='save'>保存</Button>
                        <Button theme='secondary' outline onClick={()=>{
                            this.props.closeModal();
                        }}>取消</Button>
                    </ButtonGroup>
                </div>
            </div>
        );
    }
}

export default Edit;