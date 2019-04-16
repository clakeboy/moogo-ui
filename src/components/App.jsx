/**
 * Created by clakeboy on 2017/12/3.
 */
import React from 'react';
import Header from "./Header";
import Menu from "./Menu";
import {
    Common,
    LoaderComponent,
    Modal,
} from '@clake/react-bootstrap4';
import Login from "./Login";
import {GetComponent, GetQuery} from "../common/Funcs";

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
        if (!this.state.login) {
            return <Login setLogin={this.setLogin}/>
        }
        let load_path = this.explainUrl(this.props.location.pathname);
        return (
            <div className='d-flex flex-column h-100'>
                <Header query={GetQuery(this.props.location.search)} modal={this.modal}/>
                <div className='d-flex flex-grow-1 '>
                    <Menu query={GetQuery(this.props.location.search)}/>
                    <div className='flex-grow-1' style={{overflow:'auto'}}>
                        <LoaderComponent import={GetComponent} closeModal={this.closeModal} loadPath={load_path}/>
                    </div>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }
}