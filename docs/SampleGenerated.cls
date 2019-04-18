public class ZS50Exception extends Exception{ }

/** User Class Implementation(s) **/

public class LeadDomain {

	// set this instance variable in the constructor
	List<Lead> leads;

	// implement a constructor that...
	// 1. Takes a List<Lead> as an argument
	// 2. Sets the 'leads' instance variable to the list passed into the constructor
	public LeadDomain(List<Lead> leads){
		this.leads = leads; 
	}

	// implement a method doBeforeInsert() that...
	// 1. Loops through each Lead in 'leads' and, for each
	//    1a. Checks if the 'Company' field is blank and, if so, set the field to the Lead's firstName + ' ' + lastName
	//        For this challenge, a blank field is considered one that is not just null, but an empty String. 
	//        (Hint) Check out the String class in the apex developer guide. 
	//        Example - A Lead with firstName='John' and lastName='Smith', and a blank company field value, should have the
	//        company field set to 'John Smith'. 
	//  2. Does not return a value (e.g. `void`)
	public void doBeforeInsert(){
		List<Lead> toEnrich = new List<Lead>(); 
		for(Lead l : leads){
			if(String.isBlank(l.Company)){
				l.Company = l.firstName + ' ' + l.lastName;
			} else{
				toEnrich.add(l); 
			}
		}

		if(toEnrich.size() > 0)
			LeadEnrichmentService.enrich(toEnrich);
	}

}

public class LeadEnrichmentService{
  // The enrich() method has been scaffolded for you. Make the following edits so it conforms to requirements...
  // 1. Edit the method signature so that it can be called without instantiating an instance of LeadEnrichmentService
  // 2. Implement the logic indicated by the comments within the enrich() method
  
  public /** static method mimicked by var 'LeadEnrichmentService' **/ void enrich(List<Lead> leads){
    // a. initialize and populate a Set of Strings with each unique value from the leads' Company fields
    Set<String> companies = new Set<String>(); 
    for(Lead l : leads){
        if(!String.isBlank(l.Company))
            companies.add(l.Company); 
    }
    // b. pass this Set as the sole argument to the method below
    Map<String, String> companyToIndustry = HttpEnrichmentService.enrich(companies); 
    // iterate through each of the Leads in the 'leads' argument, and set its Industry field to the appropriate value from 'companyToIndustry'
    for(Lead l : leads){
        l.Industry = companyToIndustry.get(l.Company); 
    }
  }
}



/** Set Savepoint for rollback **/

Savepoint sp = Database.setSavepoint();

/** Initialize global-scoped variables and mimic/shadow any static method declarations **/

public class HttpEnrichmentService{
    public Map<String, String> enrich(Set<String> companies){
      return new Map<String, String>{
        'Wok and Roll' => 'Accommodation and Food Services', 
        'Schwing America' => 'Manufacturing', 
        'Frying Nemo' => 'Agriculture, Forestry, Fishing and Hunting'
      };
    }
}

static HttpEnrichmentService HttpEnrichmentService = new HttpEnrichmentService();
LeadDomain ld;
List<Lead> leads;
// mimic static method(s) in class LeadEnrichmentService
static LeadEnrichmentService LeadEnrichmentService = new LeadEnrichmentService();

/** Prevalidation steps **/

try{

Lead a = new Lead(firstName='Keyser',lastName='Soze');
Lead b = new Lead(firstName='Benny', lastName='Hanna', company='Treats'); 
Lead c = new Lead(firstName='Nulland', lastName='Void', company='');
Lead d = new Lead(firstName='Steven', lastName='Fryler', company='Wok and Roll'); 
Lead e = new Lead(firstName='Garth', lastName='Algar', company='Schwing America'); 
Lead f = new Lead(firstName='Nemo', lastName='Run!', company='Frying Nemo'); 
leads = new List<Lead>{ a, b, c, d, e, f }; 
ld = new LeadDomain(leads);
ld.doBeforeInsert();


} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

/** Validations **/


// validation 0 
try{
  system.assertEquals('Keyser Soze', leads[0].company); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

// validation 1 
try{
  system.assertEquals('Treats', leads[1].company); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

// validation 2 
try{
  system.assertEquals('Nulland Void', leads[2].company); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

// validation 3 
try{
  system.assertEquals('Accommodation and Food Services', leads[3].Industry); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

// validation 4 
try{
  system.assertEquals('Manufacturing', leads[4].Industry); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

// validation 5 
try{
  system.assertEquals('Agriculture, Forestry, Fishing and Hunting', leads[5].Industry); 
} catch(Exception e){
throw new ZS50Exception(e.getMessage());
}

/** Rollback to Savepoint **/

Database.rollback(sp);