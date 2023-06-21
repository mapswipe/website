/**
 * @type {import('next-export-optimize-images').Config}
 */
const config = {
    filenameGenerator: (obj) => {
        const { path, name, width, quality, extension } = obj;
        const newName = name.split('%2F').join('/');
        return `${path}/${newName}.${width}.${quality}.${extension}`;
    },
}

module.exports = config;
