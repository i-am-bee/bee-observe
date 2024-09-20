/**
 * Copyright 2024 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

import { SpanDto } from '../span/span.dto.js';
import { TraceDto, TracePostBody } from '../trace/trace.dto.js';

import { constants } from './constants.js';

export const buildUrl = (route: string): string => {
  const port = process.env.PORT_TEST || '4002';
  return new URL(route, `http://127.0.0.1:${port}`).toString();
};

const MLFLOW_MAX_RETREIVE_ATTEMPTS = 5;
export async function waitForMlflowTrace({
  attempt = 1,
  traceId
}: {
  attempt?: number;
  traceId: string;
}): Promise<{
  status: number;
  result: TraceDto;
}> {
  const traceResponse = await makeRequest({
    route: `trace/${traceId}?include_mlflow=true&include_tree=true&include_mlflow_tree=true`
  });

  const { result } = await traceResponse.json();
  if (result.mlflow?.step !== 'CLOSE_TRACE' && attempt <= MLFLOW_MAX_RETREIVE_ATTEMPTS) {
    await setTimeoutPromise(500 * attempt);
    return waitForMlflowTrace({ traceId, attempt: ++attempt });
  }

  return {
    status: traceResponse.status,
    result
  };
}

export async function makeRequest<T>({
  route,
  method = 'get',
  body
}: {
  route: string;
  method?: string;
  body?: T;
}) {
  return fetch(buildUrl(route), {
    headers: {
      [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY,
      'Content-Type': 'application/json'
    },
    method,
    ...(body && { body: JSON.stringify(body) })
  });
}

export const spansBody = [
  {
    name: 'onStart',
    attributes: {
      target: 'react agent',
      ctx: { userId: 'xx' }
    },
    context: { span_id: 'agent-on-start' },
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:48.416Z',
    end_time: '2024-07-17T12:15:48.416Z',
    events: []
  },
  {
    name: 'onPartialUpdate',
    attributes: {
      target: 'react agent',
      data: {
        thought:
          "I don't have real-time access to current weather conditions, but I can use a search engine to find out the current weather in Málaga."
      },
      ctx: {}
    },
    context: { span_id: 'react-on-partial-update' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:50.196Z',
    end_time: '2024-07-17T12:15:50.196Z',
    events: []
  },
  {
    name: 'onPartialUpdate',
    attributes: {
      target: 'react agent',
      data: {
        thought:
          "I don't have real-time access to current weather conditions, but I can use a search engine to find out the current weather in Málaga.",
        tool_call: {
          tool: 'Google',
          tool_input: 'weather Málaga',
          tool_call_caption: 'Searching for current weather in Málaga'
        }
      },
      ctx: {}
    },
    context: { span_id: 'react-on-partial-update' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:51.305Z',
    end_time: '2024-07-17T12:15:51.305Z',
    events: []
  },
  {
    name: 'onToolStart',
    attributes: {
      target: 'Google',
      data: {
        input: 'weather Málaga',
        options: {
          name: 'Google',
          description:
            'Search a query on Google. Useful for when you need to answer questions about current events.',
          cache: { enabled: false },
          logger: { raw: {}, input: { name: 'GoogleSearchTool' } },
          options: { maxResults: 10, throttle: false, retryOptions: { maxRetries: 3 } },
          inputSchema: {
            type: 'string',
            minLength: 1,
            maxLength: 128,
            $schema: 'http://json-schema.org/draft-07/schema#'
          }
        }
      },
      ctx: {}
    },
    context: { span_id: 'tool-google' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:51.406Z',
    end_time: '2024-07-17T12:15:51.406Z',
    events: []
  },
  {
    name: 'onToolSuccess',
    attributes: {
      target: 'Google',
      data: {
        input: 'weather Málaga',
        options: {
          name: 'Google',
          description:
            'Search a query on Google. Useful for when you need to answer questions about current events.',
          cache: { enabled: false },
          logger: { raw: {}, input: { name: 'GoogleSearchTool' } },
          options: { maxResults: 10, throttle: false, retryOptions: { maxRetries: 3 } },
          inputSchema: {
            type: 'string',
            minLength: 1,
            maxLength: 128,
            $schema: 'http://json-schema.org/draft-07/schema#'
          }
        }
      },
      ctx: {}
    },
    context: { span_id: 'tool-google' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:52.640Z',
    end_time: '2024-07-17T12:15:52.640Z',
    events: []
  },
  {
    name: 'onPartialUpdate',
    attributes: {
      target: 'react agent',
      data: {
        tool_output:
          "Málaga, Andalusia, Spain Weather Forecast, with current conditions, wind, air quality, and what to expect for the next 3 days.  14-day weather forecast for Málaga.  Málaga 14 Day Extended Forecast. Weather Today Weather Hourly 14 Day Forecast Yesterday/Past Weather Climate (Averages) Currently: 91 °F. Passing clouds. (Weather station: Malaga / Aeropuerto, Spain). See more current weather.  Weather. Forecast for Spanish towns: Málaga (Málaga) - 7-Day weather forecast - Table. Aceptar cookies. Información sobre uso de cookies. Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación, y ofrecer contenidos y funcionalidades de interés. ...  Current weather in Málaga, Andalusia, Spain. Check current conditions in Málaga, Andalusia, Spain with radar, hourly, and more.  26. 84 / 74 °F. 27. 86 / 76 °F. 28. Detailed forecast for 14 days. Need some help? Current weather in Málaga and forecast for today, tomorrow, and next 14 days.  Malaga (Spain) weather. Search for a place, autocomplete also includes a 'Use my location' option and your recent locations Malaga. New, improved data now being shown on all forecasts. Find out more.  Know what's coming with AccuWeather's extended daily forecasts for Málaga, Andalusia, Spain. Up to 90 days of daily highs, lows, and precipitation chances.  Mlaga Weather Forecasts. Weather Underground provides local & long-range weather forecasts, weatherreports, maps & tropical weather conditions for the Mlaga area. ... Málaga, Málaga, Spain 10 ...  Weather report for Málaga. The whole day clear skies prevail. It is a sunny day. Temperature highs are likely to reach 79 °F. With UV-Index rising to 10, sun protection is strongly recommended. Overnight into Sunday light air is noticeable (1 to 4 mph). At daytime blows a light breeze (4 to 8 mph). Winds blowing overnight from Southeast and ..."
      },
      ctx: {}
    },
    context: { span_id: 'react-on-partial-update' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:52.640Z',
    end_time: '2024-07-17T12:15:52.640Z',
    events: []
  },
  {
    name: 'onStart',
    attributes: {
      target: 'react agent',
      ctx: {}
    },
    context: { span_id: 'agent-on-start' },
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:52.795Z',
    end_time: '2024-07-17T12:15:52.795Z',
    events: []
  },
  {
    name: 'onPartialUpdate',
    attributes: {
      target: 'react agent',
      data: {
        thought:
          'It seems like the Google search provided a lot of information about the current weather in Málaga. Let me extract the relevant information.'
      },
      ctx: {}
    },
    context: { span_id: 'react-on-partial-update' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:54.508Z',
    end_time: '2024-07-17T12:15:54.508Z',
    events: []
  },
  {
    name: 'onPartialUpdate',
    attributes: {
      target: 'react agent',
      data: {
        thought:
          'It seems like the Google search provided a lot of information about the current weather in Málaga. Let me extract the relevant information.',
        final_answer:
          "Today's weather in Málaga is mostly sunny with a high temperature of 91°F (33°C) and a low of 74°F (23°C)."
      },
      ctx: {}
    },
    context: { span_id: 'react-on-partial-update' },
    parent_id: 'agent-on-start',
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:55.992Z',
    end_time: '2024-07-17T12:15:55.992Z',
    events: []
  },
  {
    name: 'onSuccess',
    attributes: {
      target: 'react agent'
    },
    context: { span_id: 'react-on-success' },
    status_code: 'OK',
    status_message: '',
    start_time: '2024-07-17T12:15:56.026Z',
    end_time: '2024-07-17T12:15:56.026Z',
    events: []
  }
];

export const tree = [
  {
    target: 'react agent',
    id: 'agent-on-start',
    start_time: '2024-07-17T12:15:48.416Z',
    end_time: '2024-07-17T12:15:55.992Z',
    children: [
      {
        target: 'react agent',
        id: 'react-on-partial-update',
        start_time: '2024-07-17T12:15:50.196Z',
        end_time: '2024-07-17T12:15:55.992Z',
        children: [],
        status_code: 'OK',
        events: [
          {
            name: 'onPartialUpdate',
            status_code: 'OK',
            status_message: '',
            data: {
              thought:
                "I don't have real-time access to current weather conditions, but I can use a search engine to find out the current weather in Málaga."
            },
            start_time: '2024-07-17T12:15:50.196Z',
            end_time: '2024-07-17T12:15:50.196Z'
          },
          {
            name: 'onPartialUpdate',
            status_code: 'OK',
            status_message: '',
            data: {
              thought:
                "I don't have real-time access to current weather conditions, but I can use a search engine to find out the current weather in Málaga.",
              tool_call: {
                tool: 'Google',
                tool_input: 'weather Málaga',
                tool_call_caption: 'Searching for current weather in Málaga'
              }
            },
            start_time: '2024-07-17T12:15:51.305Z',
            end_time: '2024-07-17T12:15:51.305Z'
          },
          {
            name: 'onPartialUpdate',
            status_code: 'OK',
            status_message: '',
            data: {
              tool_output:
                "Málaga, Andalusia, Spain Weather Forecast, with current conditions, wind, air quality, and what to expect for the next 3 days.  14-day weather forecast for Málaga.  Málaga 14 Day Extended Forecast. Weather Today Weather Hourly 14 Day Forecast Yesterday/Past Weather Climate (Averages) Currently: 91 °F. Passing clouds. (Weather station: Malaga / Aeropuerto, Spain). See more current weather.  Weather. Forecast for Spanish towns: Málaga (Málaga) - 7-Day weather forecast - Table. Aceptar cookies. Información sobre uso de cookies. Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación, y ofrecer contenidos y funcionalidades de interés. ...  Current weather in Málaga, Andalusia, Spain. Check current conditions in Málaga, Andalusia, Spain with radar, hourly, and more.  26. 84 / 74 °F. 27. 86 / 76 °F. 28. Detailed forecast for 14 days. Need some help? Current weather in Málaga and forecast for today, tomorrow, and next 14 days.  Malaga (Spain) weather. Search for a place, autocomplete also includes a 'Use my location' option and your recent locations Malaga. New, improved data now being shown on all forecasts. Find out more.  Know what's coming with AccuWeather's extended daily forecasts for Málaga, Andalusia, Spain. Up to 90 days of daily highs, lows, and precipitation chances.  Mlaga Weather Forecasts. Weather Underground provides local & long-range weather forecasts, weatherreports, maps & tropical weather conditions for the Mlaga area. ... Málaga, Málaga, Spain 10 ...  Weather report for Málaga. The whole day clear skies prevail. It is a sunny day. Temperature highs are likely to reach 79 °F. With UV-Index rising to 10, sun protection is strongly recommended. Overnight into Sunday light air is noticeable (1 to 4 mph). At daytime blows a light breeze (4 to 8 mph). Winds blowing overnight from Southeast and ..."
            },
            start_time: '2024-07-17T12:15:52.640Z',
            end_time: '2024-07-17T12:15:52.640Z'
          },
          {
            name: 'onPartialUpdate',
            status_code: 'OK',
            status_message: '',
            data: {
              thought:
                'It seems like the Google search provided a lot of information about the current weather in Málaga. Let me extract the relevant information.'
            },
            start_time: '2024-07-17T12:15:54.508Z',
            end_time: '2024-07-17T12:15:54.508Z'
          },
          {
            name: 'onPartialUpdate',
            status_code: 'OK',
            status_message: '',
            data: {
              thought:
                'It seems like the Google search provided a lot of information about the current weather in Málaga. Let me extract the relevant information.',
              final_answer:
                "Today's weather in Málaga is mostly sunny with a high temperature of 91°F (33°C) and a low of 74°F (23°C)."
            },
            start_time: '2024-07-17T12:15:55.992Z',
            end_time: '2024-07-17T12:15:55.992Z'
          }
        ]
      },
      {
        target: 'Google',
        id: 'tool-google',
        start_time: '2024-07-17T12:15:51.406Z',
        end_time: '2024-07-17T12:15:52.640Z',
        children: [],
        status_code: 'OK',
        events: [
          {
            name: 'onToolStart',
            status_code: 'OK',
            status_message: '',
            data: {
              input: 'weather Málaga',
              options: {
                name: 'Google',
                description:
                  'Search a query on Google. Useful for when you need to answer questions about current events.',
                cache: {
                  enabled: false
                },
                logger: {
                  raw: {},
                  input: {
                    name: 'GoogleSearchTool'
                  }
                },
                options: {
                  maxResults: 10,
                  throttle: false,
                  retryOptions: {
                    maxRetries: 3
                  }
                },
                inputSchema: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 128,
                  $schema: 'http://json-schema.org/draft-07/schema#'
                }
              }
            },
            start_time: '2024-07-17T12:15:51.406Z',
            end_time: '2024-07-17T12:15:51.406Z'
          },
          {
            name: 'onToolSuccess',
            status_code: 'OK',
            status_message: '',
            data: {
              input: 'weather Málaga',
              options: {
                name: 'Google',
                description:
                  'Search a query on Google. Useful for when you need to answer questions about current events.',
                cache: {
                  enabled: false
                },
                logger: {
                  raw: {},
                  input: {
                    name: 'GoogleSearchTool'
                  }
                },
                options: {
                  maxResults: 10,
                  throttle: false,
                  retryOptions: {
                    maxRetries: 3
                  }
                },
                inputSchema: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 128,
                  $schema: 'http://json-schema.org/draft-07/schema#'
                }
              }
            },
            start_time: '2024-07-17T12:15:52.640Z',
            end_time: '2024-07-17T12:15:52.640Z'
          }
        ]
      }
    ],
    status_code: 'OK',
    events: [
      {
        name: 'onStart',
        status_code: 'OK',
        status_message: '',
        data: null,
        start_time: '2024-07-17T12:15:48.416Z',
        end_time: '2024-07-17T12:15:48.416Z'
      },
      {
        name: 'onStart',
        status_code: 'OK',
        status_message: '',
        data: null,
        start_time: '2024-07-17T12:15:52.795Z',
        end_time: '2024-07-17T12:15:52.795Z'
      }
    ]
  },
  {
    target: 'react agent',
    id: 'react-on-success',
    start_time: '2024-07-17T12:15:56.026Z',
    end_time: '2024-07-17T12:15:56.026Z',
    children: [],
    status_code: 'OK',
    events: [
      {
        name: 'onSuccess',
        status_code: 'OK',
        status_message: '',
        data: null,
        start_time: '2024-07-17T12:15:56.026Z',
        end_time: '2024-07-17T12:15:56.026Z'
      }
    ]
  }
];

export const tracePostBody: TracePostBody = {
  request: {
    message: 'What is the wheather like today?'
  },
  response: {
    text: 'very warm today in the Europe'
  },
  spans: spansBody.map((span) => {
    const { status_code, ...rest } = span;
    return {
      status_code: status_code as SpanDto['status_code'],
      ...rest
    };
  })
};
