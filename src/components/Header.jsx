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

class Header extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className='moogo-header'>
                <Button className='ml-2' icon='plus' size='sm' onClick={()=>{
                    this.modal.view({
                        title:'服务器列表',
                        content:<LoaderComponent import={GetComponent} loadPath='/server/List'/>
                    });
                }}>
                    添加服务器
                </Button>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

export default Header;