/**
 * Created by clakeboy on 2018/6/29.
 */
import React from 'react';

import '../assets/css/Login.less';

import {
    Icon,
    Input,
    Button,
    Checkbox,
    CKModal,
    Load,
    Switch
} from '@clake/react-bootstrap4';
import Fetch from "../common/Fetch";
import Storage from "../common/Storage";

class Login extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            page_data:{
                user_name:'',
                password:'',
                remember:false
            },
            init:false
        };

        let login_name = Storage.get('login_name');
        if (login_name) {
            this.state.page_data.user_name = login_name;
            this.state.page_data.remember = true;
        }
    }

    componentWillMount() {
        this.checkLogin()
    }

    componentDidMount() {

    }

    checkLogin() {
        Fetch('/serv/login/auth',{},(res)=>{
            if (res.status) {
                this.setLogin(res.data)
            } else {
                this.setState({
                    init:true
                })
            }
        },(e)=>{

        })
    }

    setLogin(user) {
        this.props.setLogin(user,true);
    }

    changeHandler(name){
        return (val)=>{
            let data = this.state.page_data;
            data[name] = val;
            this.setState({
                page_data:data
            })
        };
    }

    login = () => {
        if (this.state.page_data.remember) {
            Storage.set('login_name',this.state.page_data.user_name);
        } else {
            Storage.remove('login_name');
        }
        this.modal.loading('Signing...');
        Fetch('/serv/login/sign',{
            account:this.state.page_data.user_name,
            password:this.state.page_data.password
        },(res)=>{
            if (res.status) {
                this.modal.close();
                this.setLogin(res.data)
            } else {
                this.modal.alert(res.msg);
            }
        },(e)=>{
            this.modal.alert('remote connect error! '+e);
        })
    };

    render() {
        if (!this.state.init) {
            return this.renderLoad()
        }
        return this.renderLogin()
    }

    renderLoad() {
        return (
            <div className='text-center text-danger mt-5 mb-5'>
                <Load>loading</Load>
            </div>
        )
    }

    renderLogin() {
        let login_class = 'ck-login';
        let login_win_class = 'card ck-login-window';
        if (window.innerWidth <= 500) {
            login_class += ' ck-login-mobile';
            login_win_class += ' ck-login-window-mobile';
        }
        return (
            <div className={login_class}>
                <div className={login_win_class}>
                    <div className="card-header text-center">
                        <Icon className='mr-4' icon='terminal'/> <span className="text-info">Moogo</span>
                    </div>
                    <div className="card-body">
                        <Input className='mb-4' placeholder='Username' data={this.state.page_data.user_name} onChange={this.changeHandler('user_name')}/>
                        <Input className='mb-4' placeholder='Password' type='password'
                               onEnter={this.login}
                               data={this.state.page_data.password} onChange={this.changeHandler('password')}/>
                        <div className='row no-gutters'>
                            <div className='col align-baseline' style={{'fontSize':'1.1rem'}}>
                                Remember Username
                            </div>
                            <div className="col-4">
                                <Switch className='float-right' label='remember name' onChange={checked=>{
                                    let data = this.state.page_data;
                                    data['remember'] = checked;
                                    this.setState({
                                        page_data:data
                                    })
                                }} checked={this.state.page_data.remember}/>
                            </div>
                        </div>
                        <Button size='lg' block onClick={this.login}>Sign in</Button>
                    </div>
                </div>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

Login.propTypes = {

};

Login.defaultProps = {

};

export default Login;