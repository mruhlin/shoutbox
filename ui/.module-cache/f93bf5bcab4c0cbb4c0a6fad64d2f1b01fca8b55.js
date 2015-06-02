/** @jsx React.DOM */
'use strict';

//var React = require('react');

var ShoutBox = React.createClass({displayName: "ShoutBox",
    render: function(){
        var comments = [];
        for(var i=0; i<this.state.comments.length; i++){
            comments.push(React.createElement(Comment, {c: this.state.comments[i]}))
        }
        return (React.createElement("div", {className: "shoutBox"}, 
            React.createElement(CommentForm, null), 
            comments
        ));
    },

    getInitialState: function(){
        return {
            comments: [{
                user: "Admin",
                body: "Coments Are Loading..."
            },{
                user: "Grab",
                body: "a beer"
            }]
        }
    },

    componentDidMount: function(){
        var component = this;
        // Get initial fetch of comments
        $.get(this.props.baseUrl + "/comments.json", function(result){
            if(this.isMounted()){
                this.setState({comments: result});
            }

            // subscribe to comment stream
            if(!!window.EventSource){
                var source = new EventSource(this.props.baseUrl + "/stream/");
                source.addEventListener("newcomment", function(e){
                    console.dir(e);
                    var data = JSON.parse(e.data);
                    console.dir(data);
                    var comment = data.obj;
                    console.dir(comment);
                    var state = component.state;
                    state.comments.unshift(comment);

                    component.setState(state);
                    //this.forceUpdate();
                    return;
                }, false);
            }
            else{
                // you're using IE, so you don't get real time updates until you get browser updates.
            }
        }.bind(this));
    }

});

var Comment = React.createClass({displayName: "Comment",
    render: function(){
        return(
            React.createElement("div", {className: "comment"}, this.props.c.user, " ", this.props.c.body)
        )
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
    render: function(){
        return(
            React.createElement("form", {className: "commentForm"}, 
                "Name: ", React.createElement("input", {type: "text", ref: "name"}), 
                "Email: ", React.createElement("input", {type: "text", ref: "email"}), 
                React.createElement("textarea", {ref: "yourComment"}), 
                React.createElement("input", {type: "button", ref: "submit", value: "submit", onclick: this.handleSubmit})
            )
        );
    },

    handleSubmit: function(){
        var name = this.refs.name;
        var email = this.refs.email;
        var body = this.refs.yourComment;
        //todo
    }
});

React.render(
    React.createElement(ShoutBox, {baseUrl: "http://localhost:8001"}),
    document.getElementById("shoutboxHere")
)