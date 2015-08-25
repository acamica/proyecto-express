
/**
 * Helper de vista que imprime el contenido si
 * la vista actual es la que se le pasa por parametro
 */
exports.ifview = function (view, options) {
    if (view === options.data.root.view) {
        return options.fn();
    }
    return '';
};
