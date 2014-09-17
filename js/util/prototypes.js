

// left pad string to length of LEN with CHAR or " "
String.prototype.leftPad = Date.prototype.leftPad || function (len, char) {

  char = char || " ";
  var str = this;

  while (str.length < len) {
    str = char + str;
  }

  return str.toString();
}


