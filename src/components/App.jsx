/**
 * Created by clakeboy on 2017/12/3.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Header from "./Header";
import Menu from "./Menu";
import {CommonContext} from '../context/Common';
import {
    Common,
    LoaderComponent,
    Modal,
} from '@clake/react-bootstrap4';
import Login from "./Login";
import {GetComponent, GetQuery} from "../common/Funcs";
import Drag from "../common/Drag";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: false,
            title: '',
        };
        this.modal = null;
    }

    componentDidMount() {
        this.drag = new Drag(this.splitDom,this.splitDom,{
            start:(dragDom,evtDom,e)=>{
                dragDom.classList.add('ck-split-show');
                return true;
            },
            move:(move,dragDom,evtDom,e)=>{
                move.y = 0;
                if (move.x < 100) move.x = 100;
                if (move.x > document.body.clientWidth-200) move.x = document.body.clientWidth-200;
            },
            end:(dragDom,evtDom,e)=>{
                let dom = ReactDOM.findDOMNode(this.leftDom);
                dom.style.width = dragDom.style.left;
                dragDom.classList.remove('ck-split-show');
            }
        })
    }

    setLogin = (user, is_login) => {
        this.user = user;
        this.setState({
            login: is_login
        });
    };

    setTitle = (title) => {
        this.setState({
            title: title
        });
        document.title = title + ' - Go Terminal';
    };

    explainUrl(path) {
        let arr = path.split('/');
        arr.shift();
        let module = arr.pop();
        if (module === "") {
            module = 'Main';
        } else {
            module = Common.under2hump(module)
        }

        return arr.join('/') + "/" + module;
    }

    render() {
        // if (!this.state.login) {
        //     return <Login setLogin={this.setLogin}/>
        // }
        let load_path = this.explainUrl(this.props.location.pathname);
        return (
            <CommonContext.Provider value={{title:this.setTitle,login:this.setLogin}}>
            <div className='d-flex flex-column h-100'>
                <Header query={GetQuery(this.props.location.search)} modal={this.modal}/>
                <div className='d-flex flex-grow-1 ck-main'>
                    <Menu ref={c=>this.leftDom=c} query={GetQuery(this.props.location.search)}/>
                    <div className='flex-grow-1 main-content'>
                        <LoaderComponent import={GetComponent} closeModal={this.closeModal} loadPath={load_path}/>
                    </div>
                    <div ref={c=>this.splitDom=c} className='ck-split-line' style={{left:'200px'}}/>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
            </CommonContext.Provider>
        );
    }
}