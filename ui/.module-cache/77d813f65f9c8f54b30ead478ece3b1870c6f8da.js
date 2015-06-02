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
            React.createElement(CommentForm, {baseUrl: this.props.baseUrl}), 
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
                "Name: ", React.createElement("input", {type: "text", ref: "user"}), 
                "Email: ", React.createElement("input", {type: "text", ref: "email"}), 
                React.createElement("textarea", {ref: "yourComment"}), 
                React.createElement("input", {type: "button", ref: "submit", value: "submit", onClick: this.handleSubmit})
            )
        );
    },

    handleSubmit: function(){
        var commentForm = this;
        var name = commentForm.refs['user'].getDOMNode().value;
        var email = commentForm.refs['email'].getDOMNode().value;
        var body = commentForm.refs['yourComment'].getDOMNode().value;

        $.ajax({
            url: commentForm.props.baseUrl + "/comments.json",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "user": name,
                "body": body,
                "email": email
            }),
            success: function(){
                commentForm.refs['user'].getDOMNode().value = "";
                commentForm.refs['email'].getDOMNode().value = "";
                commentForm.refs['yourComment'].getDOMNode().value = "";
            }
        })
        //todo
    }
});

React.render(
    React.createElement(ShoutBox, {baseUrl: "http://localhost:8001"}),
    document.getElementById("shoutboxHere")
)