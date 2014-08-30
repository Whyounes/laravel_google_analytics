function OrderbyFilter( el ){
    this.el = $(el);
    this.listFilters = undefined;
    this.filter = undefined;

    this.init = function( columns ){
        this.columns = columns;

        var filter = $('<li class="filter row">' +
                        '<div class="col-md-6">' +
                            this.arrayToSelect( this.columns, 'filter_columns form-control' ) +
                        '</div>' +
                        '<div class="col-md-5">' +
                            '<select class="filter_orderform form-control">' +
                                '<option value="">Asc</option>' +
                                '<option value="-">Desc</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="col-md-1 del">' +
                            '<span class="glyphicon glyphicon-remove filter_remove"></span>' +
                        '</div>' +
                    '</li>');
        this.filter = filter.clone();

        //add list of filter to the wrapper
        this.listFilters = $('<ul class="orderby_filter"></ul>');
        this.el.append( this.listFilters );
    }//init

    this.addFilter = function( filter ){
        var cfilter = this.filter.clone();
        if( filter ){
            if( filter.hasOwnProperty('column') )
                cfilter.find('.filter_columns').val( filter.column );

            if( filter.hasOwnProperty('order') )
                cfilter.find('.filter_orderform').val( filter.order );
        }//if
        cfilter.find('.filter_remove').click( this.removeFilter );
        this.listFilters.append( cfilter );
    }//addFilter

    this.removeFilter = function( e ){
        $( e.target ).parents('.filter').remove();
    }//removeFilter

    this.getFilters = function( ){
        var filters = [];
        this.listFilters.find(".filter").each(function(i, el){
            el = $(el);

            filters.push({
                column: el.find(".filter_columns").val(),
                order: el.find(".filter_orderform").val()
            });
        });

        return filters;
    }//getFilters

    this.resetFilter = function(){
        this.listFilters.find(".filter").remove();
    }//resetFilter

    /*
        Transform an array of {name: '', value: ''} to a <select>

        columns: array of data to transform
        class: a class name to be added to select, it can be multiple class's separated by space
    */
    this.arrayToSelect = function( columns, className ){
        var select = '<select ' + ( className ? ( 'class="' + className + '"' ) : '' ) + ' >';

        for( var i = 0; i < columns.length; i++ ){
            if( $.isArray( columns[i].value ) ){
                tmp = columns[i].value;
                select += '<optgroup label="' + columns[i].name + '">';
                for( var j = 0; j < tmp.length; j++ ){
                    select += '<option value="' + tmp[j].value + '">' + tmp[j].name + '</option>';
                }//for
                select += '</optgroup>';
            }//if
            else
                select += '<option value="' + columns[i].value + '">' + columns[i].name + '</option>';
        }//for

        select += '</select>';

        return select;
    }//rawColumns

}//ChartFilter
