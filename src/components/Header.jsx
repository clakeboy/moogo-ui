/**
 * Created by clakeboy on 2019/1/17.
 */
import React from 'react';

import '../assets/css/header.less';
import {
    Button,
    CKModal,
    LoaderComponent
} from '@clake/react-bootstrap4';
import {GetComponent} from "../common/Funcs";
import {CommonContext} from "../context/Common";

class Header extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log(this.context);
    }

    render() {
        return (
            <div className='d-flex align-items-center moogo-header'>
                <Button className='ml-2' icon='server' size='sm' onClick={()=>{
                    this.modal.view({
                        title:'服务器列表',
                        content:<LoaderComponent import={GetComponent} loadPath='/server/List'/>
                    });
                }}>
                    服务器
                </Button>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

Header.contextType = CommonContext;
export default Header;