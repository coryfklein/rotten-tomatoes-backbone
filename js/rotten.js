// Rotten Tomatoes
var apikey = "3b6p7xcas3epjwqqndhbqk2y";
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";

// Upcoming movies request
var page_limit = "5"
var page = "1"
var country = "us"
var upcomingMoviesUrl = baseUrl + '/lists/movies/upcoming.json?apikey=' + apikey;
var Movies = null;

var Movie = Backbone.Model.extend({

    defaults: function() {
        return {
            title: "Unnamed movie",
            poster: "http://images.rottentomatoescdn.com/images/redesign/poster_default.gif",
            synopsis: "No synopsis"
        };
    }

});

$(function(){

    var MovieList = Backbone.Collection.extend({

        model: "Post",
        url: upcomingMoviesUrl + "&callback=upcomingMoviesCallback"
        + '&page_limit=' + page_limit
        + '&page=' + page
        + '&country=' + country
        + '&_prettyprint=true',
        sync: function(method, model, options) {
            options.timeout = 10000;
            options.dataType = "jsonp";
            options.jsonp = "upcomingMoviesCallback";
            return Backbone.sync(method, model, options);
        }

    });

    Movies = new MovieList;

    var MovieView = Backbone.View.extend({

        tagName: "li",

        template: _.template($('#item-template').html()),

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        clear: function() {
            this.model.destroy();
        }

    });

    var AppView = Backbone.View.extend({

        el: $("#rottenapp"),

        initialize: function() {
            this.footer = this.$('footer');
            this.main = $('#main');

            this.listenTo(Movies, 'add', this.addOne);

            Movies.fetch();
        },

        render: function() {
            this.main.show();
            this.footer.show();
        },

        addOne: function(movie) {
            var view = new MovieView({model: movie});
            this.$('#movie-list').append(view.render().el);
        }

    });

    var App = new AppView;

});

function upcomingMoviesCallback(data) {
    $(document.body).append('Found ' + data.total + ' upcoming films.');
    var movies = data.movies;
    $.each(movies, function(index, movie) {
        var backboneMovie = new Movie({
            title: movie.title,
            poster: movie.posters.detailed,
            synopsis: movie.synopsis
        });

        if(Movies)
        {
            Movies.add(backboneMovie);
        }
    });
};

