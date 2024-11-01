const formEl = document.querySelector('#formSection')
const textAreaEl = document.querySelector('#contactMessage')
const emailErrorEl = document.querySelector('#emailError')
const textAreaCharsEl = document.querySelector('#charactersLeft')
const textAreaErrorEl = document.querySelector('#messageError')
const messageCharsLimit = 300

const getAboutMeData = async () => {
    // fetch data for about me section
    const response = await fetch('./data/aboutMeData.json')
    const data = await response.json()
    const { aboutMe, headshot } = data || {}
    if (aboutMe && headshot) {
        // select container
        const aboutMeContainer = document.querySelector('#aboutMe')
        // create paragraph
        const aboutMeText = document.createElement("p")
        aboutMeText.textContent = aboutMe
        // create image
        const headshotContainer = document.createElement("div")
        headshotContainer.className = 'headshotCotainer'
        const headshotImg = document.createElement("img")
        headshotImg.src = "./images/headshot.webp"
        headshotImg.alt = 'headshot image'
        headshotImg.style.backgroundPosition = 'center center'
        headshotImg.style.backgroundRepeat = 'no-repeat'
        headshotImg.style.backgroundSize = 'cover'
        // append paragraph
        aboutMeContainer.appendChild(aboutMeText)
        // append image
        aboutMeContainer.appendChild(headshotContainer)
        headshotContainer.appendChild(headshotImg)
    }
}

const getProjectData = async () => {
    const response = await fetch('./data/projectsData.json')
    const projects = await response.json()
    if ((projects || []).length > 0) {
        const projectsContainer = document.querySelector('#projectList')
        // spotlight selectors
        const spotlightContainer = document.querySelector('#projectSpotlight')
        const projectSpotlightContainer = document.querySelector('#spotlightTitles')
        const spotlightTitle = document.createElement('h3')
        const spotlightDescription = document.createElement('p')
        const spotlightLink = document.createElement('a')
        spotlightLink.textContent = 'Click here to see more...'

        const projectsMarkup = []
        for (const [index, project] of projects.entries()) {
            const {
                project_id,
                project_name,
                short_description,
                long_description,
                card_image,
                spotlight_image,
                url
            } = project || {}
            const projectContainer = document.createElement('div')
            projectContainer.className = 'projectCard'
            projectContainer.id = project_id
            projectContainer.style.background = `url(${(card_image || '').replace('..', '.') || './images/card_placeholder_bg.png'})`
            projectContainer.style.backgroundPosition = 'center center'
            projectContainer.style.backgroundRepeat = 'no-repeat'
            projectContainer.style.backgroundSize = 'cover'
            const projectTitle = document.createElement('h4')
            projectTitle.textContent = project_name
            const projectDescription = document.createElement('p')
            projectDescription.textContent = short_description
            // add elements to project in carousel
            projectContainer.appendChild(projectTitle)
            projectContainer.appendChild(projectDescription)
            projectsMarkup.push(projectContainer)
            // add click listener for selecting project as spotlight
            projectContainer.addEventListener('click', () => {
                spotlightTitle.textContent = project_name || ''
                spotlightDescription.textContent = long_description || ''
                spotlightLink.href = url || ''
                spotlightLink.target = '_blank'
                spotlightContainer.style.background = `url(${(spotlight_image || '').replace('..', '.') || './images/spotlight_placeholder_bg.png'})`
                spotlightContainer.style.backgroundPosition = 'center center'
                spotlightContainer.style.backgroundRepeat = 'no-repeat'
                spotlightContainer.style.backgroundSize = 'cover'
            })
            // select first project
            if (index === 0) projectContainer.click()
        }
        // add projects to carousel
        projectsContainer.append(...projectsMarkup)
        // add spotlight elements
        projectSpotlightContainer.append(...[spotlightTitle, spotlightDescription, spotlightLink])
        // add listeners for navigation arrows
        handleNavigation()
    }
}

const handleNavigation = () => {
    const projectDimension = 200 // 200x200 box
    const projectList = document.querySelector('#projectList')
    const upArrow = document.querySelector('.arrow-left')
    const downArrow = document.querySelector('.arrow-right')
    // detect if it's mobile
    const mediaType = window.matchMedia('(max-width : 1024px)')
    const { matches: isMobile } = mediaType || {}
    upArrow.addEventListener('click', () => {
        const scrollUnit = projectList[isMobile ? 'scrollLeft' : 'scrollTop']
        const projectIndexInView = Math.ceil((scrollUnit / (projectDimension + 21))) || 1
        const isFirstProject = projectIndexInView === 1
        const newScrollProps = { behavior: 'smooth' }
        newScrollProps[isMobile ? 'left' : 'top'] = isFirstProject ? 0 : (projectIndexInView - 1) * projectDimension + (projectIndexInView - 1) * 20
        projectList.scroll(newScrollProps)
    })
    downArrow.addEventListener('click', () => {
        const scrollUnit = projectList[isMobile ? 'scrollLeft' : 'scrollTop']
        const projectIndexInView = Math.ceil((scrollUnit / (projectDimension + 20))) || 1
        const newScrollProps = { behavior: 'smooth' }
        newScrollProps[isMobile ? 'left' : 'top'] = projectIndexInView * projectDimension + projectIndexInView * 20 + 1
        projectList.scroll(newScrollProps)
    })
}

const handleFormValidate = (form) => {
    if (!form) return false
    const { contactEmail = '', contactMessage = '' } = form || {}
    const specialCharsRegex = /[^a-zA-Z0-9@._-]/
    const errors = {
        emailError: '',
        messageError: ''
    }
    const hasEmail = contactEmail.trim().length > 0
    const hasMessage = contactMessage.trim().length > 0
    // empty email validation
    if (!hasEmail) errors.emailError = 'Please provide an email!'
    // empty message validation
    if (!hasMessage) errors.messageError = 'Please provide a message!'
    // valid email
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) errors.emailError = 'Please provide a valid email!'
    // special chars in email
    if (hasEmail && specialCharsRegex.test(contactEmail)) errors.emailError = 'No special characters are allowed in the email!'
    // special chars in message
    if (hasMessage && specialCharsRegex.test(contactMessage)) errors.messageError = 'No special characters are allowed in the message!'
    // email chars above limit
    if (contactMessage.trim().length > messageCharsLimit) errors.messageError = `A maximum of ${messageCharsLimit} characters are allowed!`
    const isValid = (!errors.emailError && !errors.messageError)
    if (!isValid) {
        // validation detects errors
        if (errors.messageError) textAreaErrorEl.textContent = errors.messageError
        if (errors.emailError) emailErrorEl.textContent = errors.emailError
        return false
    } else {
        // validation is successful
        return true
    }
}


const handleFormSubmit = (e) => {
    e.preventDefault()
    // reset errors
    textAreaErrorEl.textContent = ''
    emailErrorEl.textContent = ''
    // extract form data
    const formData = new FormData(e.target)
    // convert form data to object
    const form = [...formData.entries()].reduce((form, field) => ({ ...form, [field[0]]: field[1] }), {})
    const isValid = handleFormValidate(form)
    if (isValid) alert('Congratulations! Form submission is successful!')
}

formEl.addEventListener('submit', handleFormSubmit)
textAreaEl.addEventListener('input', e => {
    // show live chars count update
    const newChars = (e.target.value || '').trim().length
    textAreaCharsEl.textContent = `Characters: ${newChars}/${messageCharsLimit}`
    if (newChars > messageCharsLimit) {
        textAreaCharsEl.style.color = 'red'
    } else {
        textAreaCharsEl.style.color = '#201b13'
    }
})

getAboutMeData()
getProjectData()