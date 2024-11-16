Rails.application.routes.draw do
  # Define las rutas de Devise
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

  # Redirección de la raíz (root) al login
  root to: redirect('/api/v1/login')

  # Define las rutas API
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :feeds, only: [:index] #Aca agregue esto
      resources :bars
      get 'current_user', to: 'users#current'  # Ruta para obtener el usuario actual
      
      resources :beers do
        resources :reviews, only: [:index, :create]
      end

      resources :events do
        member do
          post 'mark_assistance'  
          post 'upload_event_image'
          get 'get_event_images'
        end
      end

      # Búsqueda de usuarios
      get 'users/search', to: 'users#search'

      # Rutas para usuarios
      resources :users, only: [:index, :show, :create, :update] do
        get 'friendships', on: :member  # Ruta para listar amistades
        post 'friendships', on: :member, to: 'users#create_friendship'  
        resources :reviews, only: [:index, :create]
      end

      resources :reviews, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
