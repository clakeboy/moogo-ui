/**
 * Created by clakeboy on 2019-04-20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import '../assets/css/datapanel.less';
import Fetch from "../common/Fetch";
import {Icon, Modal, Table, Button} from '@clake/react-bootstrap4';
import {CTable} from '@clake/react-bootstrap4-window';
class DataPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.server = this.props.server;
        this.database = this.props.database;
        this.collection = this.props.collection;

        this.number = 50;

        this.state = {
            headers:null,
            data:null,
            currentPage:1,
            dataCount:0,
        }
    }

    componentDidMount() {
        this.loadData(1);
    }

    loadData(page) {
        this.modal.loading('加载中...');
        Fetch('/serv/exec/query',{
            server_id:this.server.id,
            database:this.database,
            collection:this.collection,
            page:page,
            number:this.number,
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.setState({
                    data:res.data.list,
                    currentPage:page,
                    dataCount:res.data.count,
                    headers:res.data.keys,
                })
            } else {
                this.modal.alert(<>
                    <p>获取数据出错!</p>
                    <p>{res.msg}</p>
                </>);
            }
        },(e)=>{
            this.modal.alert(<>
                <p>访问网络出错!</p>
                <p>{e}</p>
            </>);
        });
    }

    getClasses() {
        let base = 'ck-data-panel';
        return classNames(base,this.props.className);
    }

    formatData(val,row) {
        if (typeof val === 'object') {
            return <>
                <Icon icon='file-alt'/>{'\u0020'}
                <span>{JSON.stringify(val)}</span>
            </>;
        }
        return val;
    }

    render() {
        let show_count = this.state.currentPage * this.number;

        return (
            <div className={this.getClasses()}>
                <div className='d-flex flex-column h-100'>
                    <div className='p-1 flex-shrink-0 font-size-75'>
                        <span className='mr-2'><Icon icon='server'/> {this.server.name}</span>
                        <span className='mr-2'><Icon icon='network-wired'/> {this.server.address}:{this.server.port}</span>
                        <span className='mr-2'><Icon icon='database'/> {this.database}</span>
                    </div>
                    <div className='p-1 flex-shrink-0 font-size-75'>
                        <span className='mr-2'>显示文档:{'\u0020'}
                            {this.state.currentPage*this.number-this.number+1} - {show_count>this.state.dataCount?this.state.dataCount:show_count}
                            <span className='text-black-50 px-1'>of</span>
                            {this.state.dataCount}
                        </span>
                        <span className='px-2 border'><Icon icon='angle-left'/></span>
                        <span className='px-2 border'><Icon icon='angle-right'/></span>
                    </div>
                    <div className='flex-grow-1 h-100 overflow-hidden position-relative'>
                        {!this.state.headers || !this.state.data?this.renderEmpty():this.renderData()}
                    </div>
                </div>
                {/*{this.renderTest()}*/}
                <Modal ref={c=>this.modal = c}/>
            </div>
        );
    }

    renderTest() {
        let content = [];
        for (let i=0;i<100;i++) {
            content.push(<p>test data{i}</p>);
        }
        return content;
    }

    renderEmpty() {
        return <div className='w-100 p-3 text-center'>
            <span>没有数据</span>
        </div>
    }

    renderData() {
        // return <Table headerTheme='light' bordered hover sm data={this.state.data} fontSm width='100%' height='100%'>
        //     {this.state.headers.map((head)=>{
        //         return <Table.header field={head} text={head} width='200px'/>
        //     })}
        // </Table>
        return <CTable position={{
            right:'0',
            left:'0',
            top:'0',
            bottom:'0',
        }} move absolute bordered width='100px' height='100px' foot={false} data={this.state.data}>
            {this.state.headers.map((head)=>{
                return <Table.header onFormat={this.formatData} field={head} text={head} width='150px'/>
            })}
        </CTable>
    }
}

DataPanel.propTypes = {
    serverId: PropTypes.number,
    database: PropTypes.string,
};

DataPanel.defaultProps = {

};

export default DataPanel;