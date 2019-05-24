/**
 * Created by clakeboy on 2019-04-30.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Input,
    Button
} from "@clake/react-bootstrap4";

let EmptyCondition = {
    field:'',
    field_type:null,
    query:'',
    query_text:'',
    value:null
};

/**
 * 数据过滤
 */
class DataFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keys:props.keys,
            conditions:[]
        };

        this.filterConditions = [
            {text:'=',key:'$eq'},
            {text:'>',key:'$lt'},
            {text:'>=',key:'$lte'},
            {text:'<',key:'$gt'},
            {text:'<=',key:'$gte'},
            {text:'!=',key:'$ne'},
            {text:'re',key:'$regex'},
        ];
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.keys !== nextProps.keys) {
            this.setState({keys:nextProps.keys})
        }
    }

    changeHandler = (field,idx)=>{
        return (val,row) => {
            let data = this.state.conditions[idx];
            if (field === 'query') {
                data.query_text = row.text;
                data.query = row.key;
            } else if (field === 'field') {
                data.field = val;
                data.field_type = row;
            } else {
                data[field] = val;
            }
            this.state.conditions[idx] = data;
            this.setState({
                conditions:this.state.conditions
            })
        };
    };

    addCondition (condition) {
        if (typeof condition === 'object') {
            this.state.conditions.push(Object.assign({},condition));
        } else {
            this.state.conditions.push(Object.assign({},EmptyCondition));
        }
        this.setState({
            conditions:this.state.conditions
        })
    }

    deleteCondition(idx) {
        this.state.conditions.splice(idx,1);
        this.setState({
            conditions:this.state.conditions
        })
    }

    clearCondition() {
        this.setState({conditions:[]})
    }

    getFilter() {
        let filter = {};
        this.state.conditions.forEach((item)=>{
            if (!item.field || !item.query) {
                return false;
            }
            filter[item.field] = this.getTypeValue(item);
        });
        return filter;
    }

    getTypeValue(item) {
        let value = {};
        switch (item.field_type.type) {
            case 1:  //double
                value[item.query] = parseFloat(item.value);
                break;
            case 2:  //string
                value[item.query] = `${item.value}`;
                break;
            case 3:  //embedded document

            case 4:  //array

            case 5:  //binary

            case 6:  //undefined

            case 7:  //objectID
                value[item.query] = {"$oid":item.value};
                break;
            case 8:  //boolean

            case 9:  //UTC datetime

            case 10:  //null

            case 11:  //regex

            case 12:  //dbPointer

            case 13:  //javascript

            case 14:  //symbol

            case 15:  //code with scope

            case 16:  //32-bit integer
                value[item.query] = parseInt(item.value);
                break;
            case 17:  //timestamp

            case 18:  //64-bit integer
                value[item.query] = parseInt(item.value);
                break;
            case 19:  //128-bit decimal
                value[item.query] = parseFloat(item.value);
                break;
            case 255:  //min key

            case 127:  //max key

            default:  //invalid
                value[item.query] = item.value;
                break;
        }

        return value;
    }

    render() {
        return (
            <div>
                {this.state.conditions.map((item,idx)=>{
                    return <div className={idx>0?'form-inline mt-1':'form-inline'}>
                        <Input size='xs' width='150px' placeholder='数据字段' combo={{
                            searchColumn:'key',
                            width: 'unset',
                            showRows:10,
                            filterColumns:['key','type_name']
                        }} comboData={this.state.keys} data={item.field} onChange={this.changeHandler('field',idx)}/>
                        <Input className='px-1' size='xs' width='70px' placeholder='条件' readOnly combo={{
                            searchColumn:'text',
                            width: '100%',
                            filterColumns:['text'],
                            showRows:10
                        }} comboData={this.filterConditions} data={item.query_text} onChange={this.changeHandler('query',idx)}/>
                        <Input size='xs' width='300px' placeholder='数据' data={item.value} onChange={this.changeHandler('value',idx)}/>
                        <Button className='ml-2' size='xs' icon='trash-alt' theme='danger' onClick={()=>{
                            this.deleteCondition(idx);
                        }}/>
                    </div>
                })}
                <Button size='xs' theme='success' icon='plus' onClick={()=>{this.addCondition()}}>添加过滤</Button>
            </div>
        );
    }
}

DataFilter.propTypes = {
    keys: PropTypes.array
};

DataFilter.defaultProps = {

};

export default DataFilter;