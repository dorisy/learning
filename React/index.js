import React,{Component} from 'React'
import { Router, Route, hashHistory } from 'react-router'
class RouterTest extends Component{
	render(){
		<Router history={hashHistory}>
		  <Route path="/" component={App} />
		  <Route path="/repos" component={Repos}/>
		  <Route path="/about" component={About}/>
		</Router>
	}
}
