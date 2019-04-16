/**
 * Created by clakeboy on 2019/1/22.
 */
import React from 'react';
import {
    Button,
    CKModal, LoaderComponent,
    Table,
    TableHeader,
} from '@clake/react-bootstrap4';
import {GetComponent} from "../../common/Funcs";
import Fetch from "../../common/Fetch";

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
    };

    render() {
        return (
            <div>
                <div className='mb-1'>
                    <Button onClick={()=>{
                        this.modal.view({
                            title:'添加服务器',
                            content:<LoaderComponent import={GetComponent} closeModal={this.closeModal} loadPath='/server/Edit'/>,
                        });
                    }}>创建</Button>
                </div>
                <Table hover select={false} headerTheme='light' emptyText={<span style={{'fontSize':'1.25rem'}}>没有添加服务器</span>} data={this.state.data}>
                    <TableHeader text='服务器名称' field='server_name'/>
                    <TableHeader text='地址' field='server_ip'/>
                    <TableHeader text='SSH' field='server_ssh'/>
                    <TableHeader text='认证' field='server_ssh'/>
                </Table>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

export default List;