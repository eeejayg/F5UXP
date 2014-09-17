

function getCSSRule(ruleName, deleteFlag) 
{
  ruleName = ruleName.toLowerCase();
  
  if (!document.styleSheets) { return false; }
  
  for ( var i = 0; i < document.styleSheets.length; i++ ) 
  {
    var styleSheet = document.styleSheets[i];         
    var rulesArray = ( styleSheet.cssRules != null ) ? styleSheet.cssRules : styleSheet.rules;
    var deleteFunction = ( styleSheet.cssRules != null ) ? styleSheet.deleteRule : styleSheet.removeRule;
    
    for ( var z = 0; z < rulesArray.length; z++ )
    {
      if (( !rulesArray[z].selectorText ) || ( rulesArray[z].selectorText.toLowerCase() != ruleName ))
      { 
        
        continue; 
      }
      
      if ( deleteFlag )
      {
        if ( styleSheet.deleteRule )
        {
          styleSheet.deleteRule(z);
          return true;
        }
        styleSheet.removeRule(z);
        return true;
      }
      
      return rulesArray[z];      
    }
  }    

  return false;   
}


function deleteCSSRule(ruleName) 
{
  return getCSSRule(ruleName,'delete');                  
} 

                                                        
function addCSSRule(ruleName) 
{                           
  if (!document.styleSheets) { return false; }

  if (!getCSSRule(ruleName)) 
  {                        
    if (document.styleSheets[0].addRule) 
    {
      document.styleSheets[0].addRule(ruleName, null,0);      
    } 
    else 
    {
      document.styleSheets[0].insertRule(ruleName+' { }', 0); 
    }
  }                                                   
  
  return getCSSRule(ruleName);                            
} 
 
