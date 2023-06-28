import util from 'util';
import fs from 'fs';
import path from 'path';
import { isDefined } from '@togglecorp/fujs';
import matter from 'gray-matter';

export interface Blog {
    name: string;
    title: string;
    publishedDate?: number;
    description?: string;
    author?: string;
    coverImage?: string;
    featured: boolean;
    markdownContent: string;
}

const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const fsStats = util.promisify(fs.stat);

async function readMarkdownFiles(dir: string) {
    const fileNames = await readDir(dir);

    const filePromises = fileNames.map(async (filename) => {
        const {
            name,
            ext,
        } = path.parse(filename);
        // get current file path
        const filePath = path.resolve(dir, filename);

        const stat = await fsStats(filePath);
        // get information about the file
        // check if the current path is a file or a folder
        const isFile = stat.isFile();

        // exclude folders
        if (isFile && ext === '.md') {
            // callback, do something with the file
            const markdownContent = await readFile(filePath);
            return ({
                markdownContent: markdownContent.toString(),
                name,
            });
        }
        return undefined;
    });
    const files = await Promise.all(filePromises);

    return files.filter(isDefined);
}

const getBlogs = (async () => {
    const blogs = await readMarkdownFiles('blogs');
    return blogs.map((file) => {
        const matterResult = matter(file.markdownContent);

        return ({
            ...file,
            markdownContent: matterResult.content ?? '',
            title: (matterResult.data.title ?? file.name) as string,
            publishedDate: new Date(
                matterResult.data.publishedDate,
            ).getTime() as number | undefined,
            author: matterResult.data.author as string | undefined,
            featured: (matterResult.data.featured ?? false) as boolean,
            description: matterResult.data.description as string | undefined,
            coverImage: matterResult.data.coverImage as string | undefined,
        });
    });
});

export default getBlogs;
