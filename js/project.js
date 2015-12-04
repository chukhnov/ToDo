(function () {
    Parse.initialize("XZWlbVV725NFLOGnspDbqxAtv7AuUJ8riWoH5buT", "7TOOE2okGv0iC30UcmqfoPbDYcWUZesinXOMnjyD");

//MODEL
    ToDoListModel = Parse.Object.extend("ToDoListModel");

//COLLECTION
    ToDoListCollection = Parse.Collection.extend({model: ToDoListModel});
    var toDoListCollection = new ToDoListCollection([]);

//VIEW
    ViewForms = Backbone.View.extend({
        initialize: function () {
            $(".form, .tasks, .logout-div, #log-in, #sign-up").hide();
            $(".log-sub").show();
            this.controlCurrent();

        },
        controlCurrent: function(){
            if (Parse.User.current()) {
                this.cabinet();
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
            location.hash ='login';

        },
        sig: function () {
            location.hash ='sign';


        },
        cabinet: function () {
            location.hash ='cabinet';

        },
        logout: function () {
            location.hash ='logout';

        },

        login: function () {
            var name = $("#login-name").val();
            var pass = $("#login-password").val();
            Parse.User.logIn(name, pass, {
                success: function (user) {
                    console.log("Log In Success!");
                    this.cabinet();
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
            user.set("username", name);
            user.set("password", pass);
            user.set("email", email);
            user.signUp(null, {
                success: function (user) {
                    console.log('Sign up success!');
                    this.cabinet();
                }.bind(this), error: function (user, error) {
                    console.log("Sign Up error:" + error.message)
                }
            })
        }


    });




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
    var viewForms = new ViewForms({});
    $('.tasks').html(toDoListViewCollection.render().el);
    MyRouter = Backbone.Router.extend({
        routes: {
            '': 'main',
            'login': 'login',
            'sign': 'sign',
            'cabinet': 'cabinet',
            'logout': 'logout'
        },
        main: function(){
            viewForms.initialize();

        },
        login: function(){
            $(".form, .tasks, .log-sub, .logout-div, #sign-up").hide();
            $("#log-in").show();
            viewForms.controlCurrent();
        },
        sign: function(){
            $(".form, .tasks, .log-sub, .logout-div, #log-in").hide();
            $("#sign-up").show();
            viewForms.controlCurrent();

        },
        cabinet: function(){
            $(".log-sub, #log-in, #sign-up").hide();
            $(".form, .tasks, .logout-div").show();
            toDoListCollection.reset();
            $(".tasks").html('');
            viewForms.getElements();
        },
        logout: function(){
            Parse.User.logOut({
                success: function (user) {

                }, error: function (user, error) {
                    console.log("Log Out error:" + error.message)
                }
            });
            console.log("Log Out Success!");
            location.hash ='';

        }

    });
    var router = new MyRouter();
    Backbone.history.start();
})();