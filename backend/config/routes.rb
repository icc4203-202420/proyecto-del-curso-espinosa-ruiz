Rails.application.routes.draw do
  # Define tus rutas de Devise
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # Forzar la redirección de la raíz (root) al login
  root to: redirect('/api/v1/login')

  # Define tus rutas API
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars
      get 'current_user', to: 'users#current'
      resources :beers do
        resources :reviews, only: [:index, :create]
      end
      resources :events do
        member do
          post 'mark_assistance'
        end
      end
      resources :users, only: [:index, :show, :create, :update] do
        get 'friendships', on: :member
        post 'friendships', on: :member
        resources :reviews, only: [:index, :create]
      end
      resources :reviews, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
  