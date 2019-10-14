/**
 * Created by clakeboy on 2019-04-20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import '../../assets/css/datapanel.less';
import Fetch from "../../common/Fetch";
import {Icon, ButtonGroup, TableHeader, Button, LoaderComponent, Input, Menu} from '@clake/react-bootstrap4';
import {CTable,WModal} from '@clake/react-bootstrap4-window';
import {CommonContext} from "../../context/Common";
import {GetComponent} from "../../common/Funcs";
import DataFilter from "./DataFilter";
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
            pageCount:0,
        };

        this.sort = null;
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
            sort:this.sort,
            filter:this.getFilter(),
        },(res)=>{
            if (res.status) {
                let page_count = Math.floor(res.data.count / this.number);
                if (res.data.count % this.number !== 0) {
                    page_count++;
                }

                this.setState({
                    data:res.data.list,
                    currentPage:page,
                    dataCount:res.data.count,
                    headers:res.data.keys,
                    pageCount:page_count
                },()=>{
                    this.modal.close();
                });
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

    nextHandler = ()=>{
        if (this.state.currentPage+1 > this.state.pageCount) {
            this.loadData(this.state.pageCount);
        } else {
            this.loadData(this.state.currentPage+1);
        }
    };

    previousHandler = ()=>{
        if (this.state.currentPage - 1 < 1) {
            this.loadData(1);
        } else {
            this.loadData(this.state.currentPage-1);
        }
    };

    getClasses() {
        let base = 'ck-data-panel';
        return classNames(base,this.props.className);
    }

    formatData = (val,row,key) => {
        if (typeof val === 'undefined') {
            return <div className='bg-secondary text-white text-center'>列字段不存在</div>;
        }

        let header = this.searchDataKey(key);
        if (typeof val === 'object') {
            return <>
                <Icon icon='file-alt'/>{'\u0020'}
                <span style={{color:this.getDataTypeColor(header.type)}}>{JSON.stringify(val)}</span>
            </>;
        }
        return <span style={{color:this.getDataTypeColor(header.type)}}>{JSON.stringify(val)}</span>;
    };

    searchDataKey(key) {
        return this.state.headers.find((item)=>{
             return item.key === key;
        });
    }

    getDataTypeColor(type) {
        switch (type) {
            case 1:
                return "#208e4d";
            case 2:
                return "steelblue";
            case 7:
                return "orangered";
            case 8:
                return "#8247BC";
            case 16:
            case 18:
                return "#208e4d";
            default:
                return "unset";
        }
    }

    showData = (e,field,data)=>{
        this.context.modal().view({
            title:'修改数据',
            content:<LoaderComponent import={GetComponent} conn={{
                server:this.server,
                database:this.database,
                collection:this.collection,
            }} data={data} callback={()=>{
                this.context.modal().close();
            }} loadPath='/data/DataEdit'/>,
        });
    };

    deleteData = (e,field,data) => {

    };

    sortHandler = (field,sort_type)=>{
        if (sort_type === 'clear') {
            this.sort = null;
            return
        }
        let sortCon = {};
        sortCon[field] = sort_type==="asc"?1:-1;
        this.sort = sortCon;
        this.loadData(1);
    };

    filterHandler = (text,field,type)=>{
        if (type === 'clear') {
            this.filter.clearCondition();
            return;
        }
        let field_type = this.searchDataKey(field);
        let condition = {
            field:field,
            field_type:field_type,
            query:field_type.type === 2?'$regex':'$eq',
            query_text:field_type.type === 2?'re':'=',
            value:text
        };
        if (field_type.type === 2) {
            switch (type) {
                case 'start':
                    condition.value = `^${text}`;
                    break;
                case 'end':
                    condition.value = `${text}$`;
                    break;
                case 'contain':
                    condition.value = text;
                    break;
            }
        }

        this.filter.addCondition(condition);
    };

    getFilter = ()=> {
        return this.filter.getFilter();
    };

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
                    <div className='px-1 flex-shrink-0'>
                        <div className='ck-data-filter'>
                            <div className='flex-shrink-0 mb-1 pb-1 d-flex align-items-center border-bottom'>
                                <Button icon='play' theme='danger' size='xs' onClick={()=>{
                                    this.loadData(1);
                                }}>执行过滤</Button>
                            </div>
                            <div className='flex-grow-1'>
                                <DataFilter ref={c=>this.filter=c} keys={this.state.headers}/>
                            </div>
                        </div>
                    </div>
                    <div className='p-1 flex-shrink-0 font-size-75 d-flex align-items-center'>
                        <ButtonGroup>
                            <Button size='xs' theme='secondary' outline icon='redo' onClick={()=>{
                                this.loadData(1);
                            }}/>
                            <Button size='xs' theme='secondary' outline width='30px' icon='chevron-left' onClick={this.previousHandler}/>
                            <Button size='xs' theme='secondary' outline width='30px' icon='chevron-right' onClick={this.nextHandler}/>
                        </ButtonGroup>
                        <span className='ml-2'>显示文档:{'\u0020'}
                            <span className='font-weight-bold'>{this.state.currentPage*this.number-this.number+1} - {show_count>this.state.dataCount?this.state.dataCount:show_count}</span>
                            <span className='text-black-50 px-1'>of</span>
                            {this.state.dataCount}
                        </span>
                    </div>
                    <div className='flex-grow-1 h-100 overflow-hidden position-relative'>
                        {!this.state.headers || !this.state.data?this.renderEmpty():this.renderData()}
                    </div>
                </div>
                {/*{this.renderTest()}*/}
                <WModal ref={c=>this.modal = c}/>
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
        let menu = [
            {
                field:'editor',
                text: <><Icon className='pr-1' icon='edit'/>编辑数据</>,
                click: this.showData,
            },
            {
                field:'delete',
                text: <><Icon className='pr-1' icon='trash-alt'/>删除数据</>,
                click: this.deleteData,
            },
        ];
        return <CTable position={{
            right:'0',
            left:'0',
            top:'0',
            bottom:'0',
        }} move absolute bordered striped={false}
                       customMenu={menu} width='100px' height='100px'
                       onSort={this.sortHandler}
                       onFilter={this.filterHandler}
                       foot={false}
                       data={this.state.data}>
            {this.state.headers.map((head)=>{
                return <TableHeader onFormat={this.formatData} field={head.key} text={head.key} width='200px'/>
            })}
        </CTable>
    }
}

DataPanel.contextType = CommonContext;

DataPanel.propTypes = {
    serverId: PropTypes.number,
    database: PropTypes.string,
};

DataPanel.defaultProps = {

};

export default DataPanel;