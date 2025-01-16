function replaceClass(element, oclass, nclass) {
  if (element.classList.contains(oclass)) {
    element.classList.replace(oclass, nclass);
  }
}


const mediaQuery = window.matchMedia("(max-width: 768px)");


function handleMobileView(event) {
  if (event.matches) {
    
    
    
    let elements = document.getElementsByClassName('d-flex');
    
    
    Array.from(elements).forEach(element => {
      replaceClass(element, 'd-flex', null);
    });

    
    elements = document.getElementsByClassName('rounded-circle');
    Array.from(elements).forEach(element => {
      replaceClass(element, 'rounded-circle', 'writeup-img');
    });
  }
}


handleMobileView(mediaQuery);


mediaQuery.addEventListener('change', handleMobileView);