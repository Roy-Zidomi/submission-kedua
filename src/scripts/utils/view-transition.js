export const transitionView = async (updateDOM) => {
  if (!document.startViewTransition) {
    await updateDOM();
    return;
  }

  // Use View Transitions API
  const transition = document.startViewTransition(async () => {
    await updateDOM();
  });

  await transition.finished;
};

export const applyPageTransition = (element) => {
  element.classList.add('page-transition-enter');
  
  requestAnimationFrame(() => {
    element.classList.remove('page-transition-enter');
    element.classList.add('page-transition-enter-active');
    
    setTimeout(() => {
      element.classList.remove('page-transition-enter-active');
    }, 300);
  });
};

export default { transitionView, applyPageTransition };