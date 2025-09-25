/* eslint-ignore */
import { AllProjectsQuery } from './generated/types';

declare module './data/staticData.json' {
    const value: AllProjectsQuery;
    export default value;
}
