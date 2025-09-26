/* eslint-ignore */
import { AllDataQuery } from './generated/types';

declare module './data/staticData.json' {
    const value: AllDataQuery;
    export default value;
}
