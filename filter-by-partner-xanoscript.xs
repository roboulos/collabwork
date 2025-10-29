// Filter jobs by partner_id and attach partner relationship data
query "ashley/filter-by-partner" verb=POST {
  input {
    int partner_id
    int page?=1
    int per_page?=50
  }

  stack {
    // Get jobs filtered by partner_id
    db.query job_posting {
      where = $db.job_posting.partner_id == $input.partner_id
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
      output = [
        "itemsTotal"
        "itemsReceived"
        "curPage"
        "nextPage"
        "prevPage"
        "offset"
        "perPage"
        "items.*"
      ]
    } as $jobs
    
    // Fetch the partner data once
    db.get partner {
      where = $db.partner.id == $input.partner_id
    } as $partner
    
    // Build enriched items array with partner attached to each job
    var $enriched {
      value = []
    }
    
    // Loop through each job and attach partner
    for $job in $jobs.items {
      var $job_with_partner {
        value = $job
          |set:"single_partner":$partner
      }
      
      var $enriched {
        value = $enriched|push:$job_with_partner
      }
    }
    
    // Build final response with enriched items
    var $result {
      value = {}
        |set:"items":$enriched
        |set:"itemsTotal":$jobs.itemsTotal
        |set:"itemsReceived":$jobs.itemsReceived
        |set:"curPage":$jobs.curPage
        |set:"nextPage":$jobs.nextPage
        |set:"prevPage":$jobs.prevPage
        |set:"offset":$jobs.offset
        |set:"perPage":$jobs.perPage
    }
  }

  response = $result
}
