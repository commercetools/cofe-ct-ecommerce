import { ActionContext, ActionHandler, Context, Request, Response } from '@frontastic/extension-types';
import { getLocale } from '../utils/Request';
import type { ProjectApi as ProjectApiType } from '../apis/ProjectApi';

type ActionHook = (request: Request, actionContext: ActionContext) => Promise<Response>;

export const ProjectController = ({
  ProjectApi,
}: {
  ProjectApi: new (context: Context, locale: string) => ProjectApiType;
}): ProjectControllerType => {
  const getProjectSettings: ActionHook = async (request: Request, actionContext: ActionContext) => {
    const projectApi = new ProjectApi(actionContext.frontasticContext, getLocale(request));

    const project = await projectApi.getProjectSettings();

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(project),
      sessionData: request.sessionData,
    };

    return response;
  };
  return {
    getProjectSettings,
  };
};

export interface ProjectControllerType {
  [actionIdentifier: string]: ActionHandler;
  getProjectSettings: ActionHandler;
}
