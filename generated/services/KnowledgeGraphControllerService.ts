/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_GraphDataDTO_ } from '../models/BaseResponse_GraphDataDTO_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class KnowledgeGraphControllerService {
    /**
     * getKnowledgeGraphData
     * @param name name
     * @returns BaseResponse_GraphDataDTO_ OK
     * @throws ApiError
     */
    public static getKnowledgeGraphDataUsingGet(
      name?: string,
    ): CancelablePromise<BaseResponse_GraphDataDTO_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/knowledge_graph/get',
            query: {
                'name': name,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
