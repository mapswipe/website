/* eslint-ignore */
import { AllDataQuery } from './generated/types';

declare module './fullData/staticData.json' {
    const value: AllDataQuery;
    export default value;
}
