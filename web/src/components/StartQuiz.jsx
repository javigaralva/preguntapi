import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function StartQuiz () {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const level = searchParams.get('level')
  const limit = searchParams.get('limit')

  const [quizzes, setQuizzes] = useState([])
  const [actualQuizIndex, setActualQuestionIndex] = useState(0)
  const [actualQuestion, setActualQuestion] = useState(null)

  const [showFeedback, setShowFeedback] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizEnd, setQuizEnd] = useState(false)

  const [btnDisabled, setBtnDisabled] = useState()
  const [btnNextDisabled, setBtnNextDisabled] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/quizzes?category=${category}&level=${level}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data)
        setActualQuestion(data[0])
      })
      .catch((err) => console.log(err.message))
  }, [])

  const clearState = () => {
    setActualQuestionIndex(0)
    setActualQuestion(quizzes[0])
    setQuizEnd(false)
    setQuizScore(0)
    setBtnDisabled(false)
  }

  const handlerSelectQuestion = (e) => {
    let classBtn = 'btn-error'

    if (e.target.id === actualQuestion.correct_answer) {
      classBtn = 'btn-success'
      setQuizScore(quizScore + 1)
    } else {
      setShowFeedback(true)
      document
        .getElementById(actualQuestion.correct_answer)
        .classList.replace(
          'btn-ghost',
          'btn-success'
        )
    }

    e.target.classList.replace('btn-ghost', classBtn)
    setBtnDisabled(true)
    setBtnNextDisabled(false)

    if (actualQuizIndex === quizzes.length - 1) {
      setBtnNextDisabled(true)

      const idTimeout = setTimeout(() => {
        setQuizEnd(true)
        clearTimeout(idTimeout)
      }, 2000)
    }
  }

  return (
    <div className='container m-auto text-center w-8/12'>
      <div>
        <h2 className='mt-4 mb-4 text-3xl'>{category.toUpperCase()}</h2>
        <p className='mb-4 text-2xl'>Puntuación: {quizScore} de {quizzes.length}</p>

        {!quizEnd && (
          <>
            <p className='text-2xl'>Pregunta {actualQuizIndex + 1} de {quizzes.length}</p>

            {actualQuestion &&
              <div>
                <p className='mb-4 text-2xl'>{actualQuestion.question}</p>

                {showFeedback && actualQuestion.feedback &&
                  <div id='alert-additional-content-2' className='p-4 my-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-200' role='alert'>
                    <div className='flex items-center'>
                      <svg aria-hidden='true' className='w-5 h-5 mr-2 text-red-900 dark:text-red-800' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' /></svg>
                      <span className='sr-only'>Info</span>
                      <h3 className='text-lg text-red-900 dark:text-red-800 font-bold'>¿Por que me quedó mal?</h3>
                    </div>
                    <div className='mt-2 mb-4 text-start pl-8 text-md text-red-900 dark:text-red-800'>
                      {actualQuestion.feedback}
                    </div>
                  </div>}

                <div className='mb-2'>
                  {Object.keys(actualQuestion.answers).map((key) => (
                    <button
                      key={key + actualQuizIndex}
                      id={key}
                      className='mt-2 btn btn-block border border-black btn-ghost normal-case !text-black text-xl h-max disabled:btn-active'
                      disabled={btnDisabled}
                      onClick={handlerSelectQuestion}
                    >
                      {actualQuestion.answers[key]}
                    </button>
                  ))}
                </div>
              </div>}
          </>
        )}
      </div>

      <div className='d-grid'>
        {quizEnd
          ? (
            <>
              <button
                className='mt-2 btn btn-block btn-primary text-xl text-white'
                onClick={clearState}
              >
                REPETIR QUIZ
              </button>
              <Link to='/quiz' className='mt-2 btn btn-block btn-primary text-xl text-white'>
                SALIR
              </Link>
            </>
            )
          : (
            <button
              className='btn btn-block btn-primary text-xl text-white disabled:btn-active disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={btnNextDisabled}
              onClick={() => {
                setActualQuestion(quizzes[actualQuizIndex + 1])
                setActualQuestionIndex(actualQuizIndex + 1)
                setBtnDisabled(false)
                setBtnNextDisabled(true)
              }}
            >
              SIGUIENTE
            </button>
            )}
      </div>
    </div>
  )
}
