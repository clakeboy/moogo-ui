/**
 * Created by clakeboy on 2017/12/3.
 */
import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log("run")
    }

    render() {
        return (
            <div>
                clake
            </div>
        );
    }
}