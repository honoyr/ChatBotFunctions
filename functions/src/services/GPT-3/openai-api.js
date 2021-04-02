"use strict";

import config from "../../config/gpt-3Config";
import {GPT3APIkey} from "../../const";
import axios from "axios";

// eslint-disable-next-line require-jsdoc
export default class OpenAI {
  // eslint-disable-next-line require-jsdoc
  constructor() {
    this._api_key = GPT3APIkey;
  }

  // eslint-disable-next-line camelcase,require-jsdoc
  _safe_cast(number) {
    return isNaN(Number(number)) ? null : Number(number);
  }

  // eslint-disable-next-line camelcase,require-jsdoc
  _construct_parameter(name, value) {
    return (typeof value === "undefined" || value === null) ? null : {[name]: value};
  }

  // eslint-disable-next-line camelcase,require-jsdoc
  _send_request(opts) {
    const url = config.completionURL(opts.engine);
    const reqOpts = {
      headers: {
        "Authorization": `Bearer ${this._api_key}`,
        "Content-Type": "application/json",
      },
    };
    const data = Object.assign({},
        this._construct_parameter("prompt", opts.prompt),
        this._construct_parameter("stream", opts.stream),
        this._construct_parameter("stop", opts.stop),
        this._construct_parameter("max_tokens", this._safe_cast(opts.maxTokens)),
        this._construct_parameter("temperature", this._safe_cast(opts.temperature)),
        this._construct_parameter("top_p", this._safe_cast(opts.topP)),
        this._construct_parameter("presence_penalty", this._safe_cast(opts.presencePenalty)),
        this._construct_parameter("frequency_penalty", this._safe_cast(opts.frequencyPenalty)),
        this._construct_parameter("best_of", this._safe_cast(opts.bestOf)),
        this._construct_parameter("n", this._safe_cast(opts.n)),
        this._construct_parameter("logprobs", this._safe_cast(opts.logprobs)),
        this._construct_parameter("echo", opts.echo),
    );
    return axios.post(url, data, reqOpts);
  }

  // eslint-disable-next-line require-jsdoc
  complete(opts) {
    return this._send_request(opts);
  }

  // eslint-disable-next-line require-jsdoc
  search(opts) {
    const url = config.searchURL(opts.engine);
    const reqOpts = {
      headers: {
        "Authorization": `Bearer ${this._api_key}`,
        "Content-Type": "application/json",
      },
    };
    const data = {
      documents: opts.documents,
      query: opts.query,
    };
    return axios.post(url, data, reqOpts);
  }
}
