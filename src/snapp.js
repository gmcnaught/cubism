/*
modified from graphite to match SNAPP 3.0 api used by SNAPP UI
 */
cubism_contextPrototype.snapp = function(host) {
  if (!arguments.length) host = "";
  var source = {},
      context = this;

  source.metric = function(expression) {
    var sum = "sum";

    var metric = context.metric(function(start, stop, step, callback) {
      var target = expression;

      // Apply the summarize, if necessary.
      /*if (step !== 1e4) target = "summarize(" + target + ",'"
          + (!(step % 36e5) ? step / 36e5 + "hour" : !(step % 6e4) ? step / 6e4 + "min" : step / 1e3 + "sec")
          + "','" + sum + "')";
      */
      d3.json(host + "services/graphing.cgi?method=get_graph_data&"
	      + "&target=" + target 
          + "&start=" + cubism_graphiteFormatDate(start - 2 * step) // off-by-two?
          + "&end=" + cubism_graphiteFormatDate(stop - 1000), function(data) {
        if (!data) return callback(new Error("unable to load data"));
        callback(null, cubism_SNAPParse(data));
      });
    }, expression += "");

    metric.summarize = function(_) {
      sum = _;
      return metric;
    };

    return metric;
  };

  source.find = function(pattern,metric, callback) {
    d3.json(host + "services/snapp.cgi?method=get_collections_by_search"
        + "&search=" + encodeURIComponent(pattern), function(result) {
      if (!result) return callback(new Error("unable to find metrics"));
      callback(null, result.metrics.map(function(d) { return d.path; }));
    });
  };

  // Returns the snapp host.
  source.toString = function() {
    return host;
  };

  return source;
};

// SNAPP understands seconds since UNIX epoch.
function cubism_snappFormatDate(time) {
  return Math.floor(time / 1000);
}

// Helper method for parsing SNAPP's JSON format.
function cubism_SNAPPParse(json,root_metric) {

}
