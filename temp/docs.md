@startuml

title Sales Volume Dashboard - Class Diagram


class VolumeDashboard {
  +Stat Total Sales Volume
  +Stat Cash sales
  +Stat Credit sales
  +Stat Order sales
  +Stat Deposit amount

  +Chart Sales vs Target [3D Cylinder chart]
  +Chart Cash vs Credit [Pie chart]
  +Table Credit sales per employee/outlet
  +Chart YTD vs LY [BarChart]
  +ChartOrder Sales [line chart]
  
  +Reference Timeline Filter
  +Button Refresh
  +Button Export[Optional]
}

class DropdownTimelineFilter {
  +ListItem Daily 
  +ListItem Weekly 
  +ListItem Monthly 
  +ListItem Annualy 

}


DropdownTimelineFilter "1"*-up-"many" VolumeDashboard:Composition  

@enduml



@startuml

title Volume Dashboard - Activity Diagram

'The line below is the only difference between the previous diagram's code'
!pragma useVerticalIf on   

start
if (User has Access Privilege) then (yes)

:click on Volume Dashboard sidebar navigation;


: Set Timeline filter;
fork
  :view total sales volume chart;
fork again
  :view sales vs target chart;
fork again
  :view cash vs credit chart;
fork again
  :view YTD chart;
end fork
  :Export;

else
  :Access denied;
endif
:Access other modules;
stop

@enduml



@startuml

title Assign Role to user - Activity Diagram 

start

if(User has Access Privilege)
  :Open User Panel;
  
  :View list of users;
  fork
  while(Add role button click?) is (yes)

      :display form modal;

      :Write role name;
      :Select privilege module;
      :Set access;
      :Submit;
      note left:  New role set.

  
  endwhile(no)
  
      fork again
      
      if(User has Edit Privilege) then (yes)
        :Click Edit button;
        :View Update Form modal;
        :Incert changes;
        :Submit;
        note left: Entry updated;
      else(no)
      endif
      
      fork again
      if(User has Delete Privilege) then (yes)
        :Click Delete button;
        :View Update Form modal;
        :Click Delete confirmation button;
        note left: Entry Deleted;
      else(no)
      endif
      
      fork end

else(no)
endif      

stop

@enduml






@startuml

title Warehouse Module - Activity Diagram

start

if(User has Access Privilege)
  :Click sidebar navigation dropdown;
  
  
  switch(Warehouse status)
  
    case(Click Warehouse navigation)
      :View list of Warehouses;
      
      if(User has Create Privilege) then (yes)
        :Click Add Warehouse button;
        :View Add Form modal;
        :Insert neccessary information;
        :Submit;
        note left: New Warehouse created;
      else(no)
      endif
      
      if(User has Edit Privilege) then (yes)
        :Click Edit button;
        :View Update Form modal;
        :Insert changes;
        :Submit;
        note left: Warehouse entry updated;
      else(no)
      endif
      
      if(User has Delete Privilege) then (yes)
      
        :Click Edit button;
        :View Delete warning modal;
        :Click Delete confirmation button;
        note left: Warehouse entry Deleted;
      else(no)
      endif
      
    case(Click Inventory navigation)
      :View Inventory list;
      
      if(User has Create Privilege) then (yes)
        :Click Add Inventory button;
        :View Add Form modal;
        :Insert neccessary information;
        :Submit;
        note left: New Inventory created;
      else(no)
      endif
      
      if(User has Edit Privilege) then (yes)
        :Click Edit button;
        :View Update Form modal;
        :Insert changes;
        :Submit;
        note left: Entry updated;
      else(no)
      endif
      
      if(User has Delete Privilege) then (yes)
      
        :Click Edit button;
        :View Delete warning modal;
        :Click Delete confirmation button;
        note left: Inventory entry Deleted;
      else(no)
      endif
      
    case(Click Pending navigation)
      :View Inventory Request list;
      :Approve Inventory Request;
      :Reject Inventory Request;
      If (Add Deposit Request button) then (yes)
        :View Form modal;
        :Insert neccessary information;
        :Submit;
        note left: New Inventory request added to Pending
      else (no)
      endif
      
      
    case(Click Approved navigation)
      :View Approved Inventory requests list;
      if(User has Edit Privilege) then (yes)
        :Click Edit button;
        :View Update Form modal;
        :Insert changes;
        :Submit;
        note left: Entry updated;
      else(no)
      endif
      
      if(User has Delete Privilege) then (yes)
      
        :Click Edit button;
        :View Delete warning modal;
        :Click Delete confirmation button;
        note left: Entry Deleted;
      else(no)
      endif
    
    case(Click Rejected navigation)
      :View Rejected Inventory requests list;
      if(User has Edit Privilege) then (yes)
        :Click Edit button;
        :View Update Form modal;
        :Insert changes;
        :Submit;
        note left: Entry updated;
      else(no)
      endif
      
      if(User has Delete Privilege) then (yes)
        :Click Delete button;
        :View Delete warning modal;
        :Click Delete confirmation button;
        note left: Entry Deleted;
      else(no)
      endif
  
  endswitch

else(no)
endif 

stop


@enduml


@startuml

title Top Customer & Products Dashboard - Class Diagram


class PerformanceDashboard {
  +Chart Category Share  [Donut chart]
  +Table Top performing subcategories [Table]
  +Chart Top performing products [Bar chart]
  +Chart All Products Performance by Sku Overtime
  
  +Table Top performing customers [Table]
  +Chart Top performing customers [Bar chart]
  +Reference Filter
  +Button Refresh
  +Button Export[Optional]
}

class Filter {
  +ListItem Button Category
  +ListItem Button Sub Category
  +ListItem Business Entity
  +ListItem Button Territory
  +ListItem Button Route
  +listItem Button pointOfSale

}


Filter "1"*-up-"many" PerformanceDashboard:Composition  

@enduml


@startuml

title Employee Dashboard - Class Diagram


class EmployeeDashboard {
  +Chart Sales Volume
  +Chart Top Performing Employees
  +Table Employee Progress to Target
  +Chart Call Completion and Productivity [3D Cylinder Chart and Line Chart]
  +Chart Penetration [3D Cylinder Chart]
  
  +Map EmployeeTrackMap
  +Button Refresh
  +Button Export[Optional]
}



class DropdownTimelineFilter {
  +ListItem Daily 
  +ListItem Weekly 
  +ListItem Monthly 
  +ListItem Annualy
}

class EmployeeFilter {
  +SearchBar Filter Specific Employee
}
DropdownTimelineFilter "1"*-up-"many" EmployeeDashboard:Composition  


@enduml



@startuml

title Employee Dashboard - Class Diagram


class EmployeeDashboard {
  +Card Sold Volume
  +Card Top Performing employees
  +Reference EmployeeTable
  +Map EmployeeTrackMap
  +Button Refresh
  +Button Export[Optional]
}



class EmployeeTable {
  +text name;
  +number amount;
  +number target;
  +number progress;
}



@enduml

@enduml


@startuml

title Finance Dashboard- Class Diagram


class FinanceDashboard {
  +Stat Paid/Cash amount
  +Stat Void amount
  +Stat Credit amount
  +Chart Purchase vs sales [Bar chart]
  +Chart Deposit vs sales [Pie chart]
  +Table Remaining Deposits per Sales Rep [Table]
  +Chart Inventory / Purchased, defect, sold  [Piechart]
  +Button Refresh
  +Button Export[Optional]
}



@enduml

@startuml

title Warehouse State Model

state "Warehouse Navigation Open" as wOpen
state "Warehouse Page" as wp {
  state "View warehouses Table" as wt
  state "Create new warehouse" as cw
}
state "Warehouse-Stop Page" as ws {
  state "Request Warehouse-Stop Page" as rws
  state "Approved Warehouse-stop page" as wsa
  state "Rejected Warehouse-stop page" as wsr
}

state "InventoryPage" as ip {
  state "View Inventory list table"
  state "Add new Product Inventory"
}



[*] --> wOpen
wOpen --> ip
wOpen --> ws
wOpen --> wp
rws -->wsa: "Approve Warehouse-stop request"
rws -->wsr: "Reject Warehouse-stop request"

wp-->[*]
ws-->[*]
ip-->[*]



@enduml