# ZS50

zs50 is a `node` application which can be run from the command line or used as a standard npm package. It is used to **declaratively specify Apex code to be generated and executed anonymously in a Salesforce org, and to validate expected outcomes of that execution.**. Assertions are declared in simple `yaml` configuration files.

Although zs50 was originally built to support users taking the Salesforce-focused [ZS50](https://alpha-bytes.github.io/zs50-content/) course (companion resource to Harvard's online `CS50`), it can utilize any properly-formatted yaml file to generate and execute anonymous Apex and validate results. 

## Use Cases

The original intent of the cli was to create a "checker" for Salesforce development-related learning content. However, any flow where an end user provides implementation of pre-defined classes, and the outcome of those classes needs to be verified, can be implemented through zs50. 

## Configuration Files

ZS50 validations are configured in yaml format and must end in the full `.yaml` file extension. Following is a sample configuration file with all variables that are valid in the current version of zs50, and a usage description for each. 

Commented references to `validation` or `validationName` below generally refer to the file itself and its name, respectively. The one exception is for the `validations` variable itself.

### `sample.yaml`

```yaml
--- 
# **REQUIRED** Each validation may utilize one or more apex classes. Class names are case-sensitive.
apexClassNames: 
  - LeadDomain
  - LeadEnrichmentService

# **OPTIONAL**
# This value is used by the ZS50 command `ZS50 scaf <validationName>` to print out a scaffolded class structure / instructions for passing the validation. Any yaml literal block is valid. 
scaffold: |
  public class LeadDomain {
    // update the class you implemented in week2
    // In your existing doBeforeInsert() method...
    //  1. Initialize an empty List of Leads
    //  2. For each Lead in the 'leads' instance variable, if the Lead.Company field is NOT blank, add it to the list
    //    * HINT - null and blank are not always the same thing. You may want to use the String.isBlank() method ;) 
    //  3. Pass the list to LeadEnrichmentService.enrich() (see below)
  }

  public class LeadEnrichmentService{
    // The enrich() method has been scaffolded for you. Make the following edits so it conforms to requirements...
    // 1. Edit the method signature so that it can be called without instantiating an instance of LeadEnrichmentService
    // 2. Implement the logic indicated by the comments within the enrich() method
    
    public void enrich(List<Lead> leads){
      // a. initialize and populate a Set of Strings with each unique value from the leads' Company fields
      // b. pass this Set as the sole argument to the method below
      Map<String, String> companyToIndustry = HttpEnrichmentService.enrich(// your Set here); 
      // iterate through each of the Leads in the 'leads' argument, and set its Industry field to the appropriate value from 'companyToIndustry'
    }
  }

# **OPTIONAL**
# When true, database transactions occuring during execution will be commited if the transaction completes without exception. 
# When false, validation will instantiate a Database Savepoint and rollback all dml operations at the conclusion of execution. When ommitted, defaults to false. 
commitDml: false

# **OPTIONAL**
# Following are variables that get initialized in the containing (i.e. outer class) scope of the execute anonymous transaction.
# These lines are NOT wrapped in a try/catch block in the generated Apex and, as such, should be used with caution. 
globalVars: 
  - |
    public class HttpEnrichmentService{
        public Map<String, String> enrich(Set<String> companies){
          return new Map<String, String>{
            'Wok and Roll' => 'Accommodation and Food Services', 
            'Schwing America' => 'Manufacturing', 
            'Frying Nemo' => 'Agriculture, Forestry, Fishing and Hunting'
          };
        }
    }
  # will mimic a static method call by shadowing the class name
  - "static HttpEnrichmentService HttpEnrichmentService = new HttpEnrichmentService();"
  - "LeadDomain ld;" 
  - "List<Lead> leads;"

# **OPTIONAL**
# Prevalidation executions are wrapped in a try/catch block, and are helpful for any pre-processing steps required for validations.
# steps. Often they will perform actions against global variables initialized above. 
executePrevalidation: 
  - |
    Lead a = new Lead(firstName='Keyser',lastName='Soze');
    Lead b = new Lead(firstName='Benny', lastName='Hanna', company='Treats'); 
    Lead c = new Lead(firstName='Nulland', lastName='Void', company='');
    Lead d = new Lead(firstName='Steven', lastName='Fryler', company='Wok and Roll'); 
    Lead e = new Lead(firstName='Garth', lastName='Algar', company='Schwing America'); 
    Lead f = new Lead(firstName='Nemo', lastName='Run!', company='Frying Nemo'); 
    leads = new List<Lead>{ a, b, c, d, e, f }; 
    ld = new LeadDomain(leads);
    ld.doBeforeInsert();

# **REQUIRED**
# At least one validation is required per validation file. Each validation is wrapped in its own try/catch block. Valid keys include: 
#  - assert: (Required IF 'evaluate' is excluded) Any of the Apex system.Assert() variants are valid. Note that if an assertion fails, an uncatchable System.Exception is thrown and returned to the caller. In these cases 'invMsg' (below) is ignored.
#  - evaluate: (Required IF 'assert' is excluded) Any Apex statement that evaluates to a Boolean, where true indicates a passing assertion, and false a failing one. Note that the various Apex System.assert() variants may NOT be used here, as they do not evaluate to a Boolean and throw uncatchable exceptions. 
#  - execute: (optional) steps to be completed prior to assert / evaluate. 
#  - invMsg: (optional) If a custom exception message is desired, this value is any apex statement that evaluates to a single, valid String, which will be returned as the exception message upon an 'evaluate' statement returning false. 
validations:
  
  - assert: "system.assertEquals('Keyser Soze', leads[0].company);"
  - assert: "system.assertEquals('Treats', leads[1].company);"
  - assert: "system.assertEquals('Nulland Void', leads[2].company);"
  - assert: "system.assertEquals('Accommodation and Food Services', leads[3].Industry);"
  - assert: "system.assertEquals('Manufacturing', leads[4].Industry);"
  - assert: "system.assertEquals('Agriculture, Forestry, Fishing and Hunting', leads[5].Industry);"

...
```

For reference, you can see the Apex code generated by the configuration file above [here](./docs/SampleGenerated.cls) (assuming the caller has created all classes specified in the `apexClassNames` variable). 