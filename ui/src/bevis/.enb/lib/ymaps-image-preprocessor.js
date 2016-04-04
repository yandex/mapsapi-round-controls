/**
 * @fileOverview Обрабатывает картинки.
 */
var inherit = require('inherit');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var ymapsImages = {};

module.exports = {
    /**
     * Принимает на вход путь до изображения, получает хэш и сохраняет его 
     * с именем hash.extension в указанную дирректорию.
     * @param   {String} imagePath Путь до изображения.
     * @param   {String} saveTo Куда его нужно сохранить.
     * @returns {String} Имя файла в формате hash.extension
     */
    process: function (imagePath, saveTo) {
        if (!fs.existsSync(imagePath)) {
            console.log('Изображение не найдено: ', imagePath);
            return null;
        }

        var extension = imagePath.split('.').pop();
        var md5sum = crypto.createHash('md5');
        var data = fs.readFileSync(imagePath);

        md5sum.update(data);

        var d = md5sum.digest('hex');
        var fileName = d + '.' + extension;

        if (!ymapsImages[d]) {
            var filePath = path.resolve('.', saveTo, fileName);
            fs.writeFileSync(filePath, data);
            ymapsImages[d] = true;
        }    
    
        return fileName;
    }
}