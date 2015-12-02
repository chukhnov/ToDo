
Parse.initialize("XZWlbVV725NFLOGnspDbqxAtv7AuUJ8riWoH5buT", "7TOOE2okGv0iC30UcmqfoPbDYcWUZesinXOMnjyD");

//MODEL
ToDoListModel = Parse.Object.extend("ToDoListModel");

//COLLECTION
ToDoListCollection = Parse.Collection.extend({model: ToDoListModel});
var toDoListCollection = new ToDoListCollection([]);

//VIEW
ViewForms = Backbone.View.extend({
    initialize: function () {
        $(".form").hide();
        $("#log-in").hide();
        $("#sign-up").hide();
        $(".tasks").hide();
        $(".log-sub").show();
        $(".logout-div").hide();
        if (Parse.User.current()) {
            this.staylogin();


        }

    },
    getElements: function () {
        var query = new Parse.Query('ToDoListModel');
        var user = Parse.User.current();
        query.equalTo("relation", user);
        query.find({
            success: function (res) {
                for (var i in res)
                    toDoListCollection.add(res[i])
            },
            error: function (er) {
                console.log('Query error  ' + er.message)

            }
        });


    },
    el: "body",
    events: {
        'click #login-submit': 'login',
        'click #sign-up-submit': 'signup',
        'click #logout': 'logout',
        'click #sig': 'sig',
        'click #log': 'log'

    },
    log: function () {
        $(".form").hide();
        $("#log-in").show();
        $("#sign-up").hide();
        $(".tasks").hide();
        $(".log-sub").hide();
        $(".logout-div").hide();
        if (Parse.User.current()) {
            this.staylogin();

        }

    },
    sig: function () {
        $(".form").hide();
        $("#log-in").hide();
        $("#sign-up").show();
        $(".tasks").hide();
        $(".log-sub").hide();
        $(".logout-div").hide();
        if (Parse.User.current()) {
            this.staylogin();

        }

    },
    login: function (event) {
        event.preventDefault();

        var name = $("#login-name").val();
        var pass = $("#login-password").val();

        Parse.User.logIn(name, pass, {
            success: function (user) {
                console.log("Log In Success!");
                $("#log-in").hide();
                this.staylogin();
            }.bind(this), error: function (user, error) {
                console.log("Log In error:" + error.message)
            }
        });

    },
    signup: function () {
        var name = $("#sign-up-name").val();
        var pass = $("#sign-up-password").val();
        var email = $("#email").val();
        var user = new Parse.User();
        alert('!');
        user.set("username", name);
        user.set("password", pass);
        user.set("email", email);
        user.signUp(null, {
            success: function (user) {
                console.log('Sign up success!');
                $("#sign-up").hide();
                this.staylogin();
            }.bind(this), error: function (user, error) {
                console.log("Sign Up error:" + error.message)
            }
        })
    },
    logout: function () {
        Parse.User.logOut({
            success: function (user) {

            }, error: function (user, error) {
                console.log("Log Out error:" + error.message)
            }
        });
        console.log("Log Out Success!");
        this.initialize();
        $(".tasks").html('');
        $("#signup-name").val(null);
        $("#signup-password").val(null);


    },
    staylogin: function () {
        $(".log-sub").hide();
        $(".form").show();
        $(".tasks").show();
        $(".logout-div").show();
        toDoListCollection.reset();
        this.getElements();
    }


});


var viewForms = new ViewForms({});


//VIEW
ViewToDoListSet = Backbone.View.extend({
    el: '#addTask',
    events: {
        'submit': 'submit',
        'click .button': 'button'

    },
    submit: function (e) {
        e.preventDefault();
        if (!$.trim($(e.currentTarget).find('input[type=text]').val())) {
            return
        }
        var toDoListModel = new ToDoListModel({});
        toDoListModel.save({'task': $(e.currentTarget).find('input[type=text]').val()}, {
            success: function (object) {
                $(".success").show();
            },
            error: function (model, error) {
                $(".error").show();
            }
        });
        this.collection.add(toDoListModel);
        var user = Parse.User.current();
        var relation = toDoListModel.relation("relation");
        relation.add(user);
        toDoListModel.save();
        $("#task").val(null);


    },
    button: function (e) {
        e.preventDefault();
        for (var i = 0; i < _.size(this.collection); i++) {
            if (this.collection.models[i].get('checked') == true) {
                this.collection.models[i].destroy();
                i--

            }
        }

    }
});
var viewToDoListSet = new ViewToDoListSet({collection: toDoListCollection});


//VIEW
ToDoListViewCollection = Backbone.View.extend({
    el: '.tasks',
    initialize: function () {
        this.collection.on('add', this.addOne, this);
        return this;

    },
    addOne: function (task) {
        var viewModelToDoList = new ViewModelToDoList({model: task});
        this.$el.append(viewModelToDoList.render().el);

    }

});
var toDoListViewCollection = new ToDoListViewCollection({collection: toDoListCollection});

//VIEW
ViewModelToDoList = Backbone.View.extend({
    tagName: 'li',
    initialize: function () {
        this.model.on('destroy', this.remove, this);


    },
    template: _.template('<input type="checkbox"> <span class="strike"><%= task %></span> ' +
        '<button type="button" class="share-button"><i class="fa fa-share"></i> Share</button>'),
    render: function () {
        var template = this.template(this.model.toJSON());
        this.$el.html(template);
        if (this.model.get('checked') == true) {
            console.log(this.$el.find('input[type=checkbox]'));
            this.$el.find("input[type=checkbox]").prop("checked", true);
        }
        if (this.model.get("shared")) {
            this.$el.append('<i class="fa fa-eye"><em>Shared</em></i>')
        }
        return this;
    },
    events: {
        'click [type="checkbox"]': 'clicked',
        'click .share-button': 'share'
    },
    share: function () {
        var shareTo = prompt('Enter e-mail');
        var q = new Parse.Query("User");
        var task = this.model;
        var relation = task.relation("relation");
        q.equalTo("email", shareTo);
        q.find({
            success: function (res) {
                for (var i in res)
                    console.log(res[0])
                relation.add(res[0]);
                task.set('shared', true);
                task.save();
            },
            error: function (er) {
                console.log('Query error  ' + er.message)

            }
        });

    },
    clicked: function () {
        if (this.model.get('checked') == true) {
            this.model.save('checked', false);

        }
        else {
            this.model.save('checked', true);

        }

    },

    remove: function () {
        this.$el.remove();
    }


});
$('.tasks').html(toDoListViewCollection.render().el);
