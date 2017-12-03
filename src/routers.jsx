/**
 * Created by clakeboy on 2017/12/3.
 */
import React from 'react';
import {
    Route,
    Switch,
    BrowserRouter
} from 'react-router-dom';

import App from './components/App';

const routes = (
    <BrowserRouter>
        <Switch>
            <Route path="/:dict/:component/(:id)" component={App} />
            <Route path="/:component(/:id)" component={App} />
            <Route component={App}/>
        </Switch>
    </BrowserRouter>
);

export default routes;