function btoa(str) {
  return Buffer.from(str).toString('base64');
}

function svg_base64(path, fill) {
  var svg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="' + path + '" fill="' + fill + '"/></svg>';
  return btoa(svg);
}